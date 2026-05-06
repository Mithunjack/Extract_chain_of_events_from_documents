#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_LOG="${ROOT_DIR}/backend.dev.log"
FRONTEND_LOG="${ROOT_DIR}/frontend.dev.log"

print_step() {
  printf '\n==> %s\n' "$1"
}

ensure_env_file() {
  if [[ ! -f "${ROOT_DIR}/.env" ]]; then
    cp "${ROOT_DIR}/.env.example" "${ROOT_DIR}/.env"
    print_step "Created .env from .env.example"
  fi
}

docker_available() {
  command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1
}

local_requirements_available() {
  command -v python3 >/dev/null 2>&1 && command -v npm >/dev/null 2>&1
}

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "${BACKEND_PID}" >/dev/null 2>&1 || true
  fi
  if [[ -n "${FRONTEND_PID:-}" ]]; then
    kill "${FRONTEND_PID}" >/dev/null 2>&1 || true
  fi
}

run_with_docker() {
  print_step "Starting full stack with Docker Compose"
  cd "${ROOT_DIR}"
  exec docker compose up --build
}

run_locally() {
  print_step "Starting local backend and frontend"
  cd "${ROOT_DIR}"

  if [[ ! -d "${ROOT_DIR}/.venv" ]]; then
    python3 -m venv .venv
  fi

  "${ROOT_DIR}/.venv/bin/python" -m pip install -r requirements.txt

  if [[ ! -d "${ROOT_DIR}/frontend/node_modules" ]]; then
    (cd "${ROOT_DIR}/frontend" && npm install)
  fi

  trap cleanup EXIT INT TERM

  print_step "Launching backend on http://localhost:8000"
  "${ROOT_DIR}/.venv/bin/python" -m uvicorn backend.app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload >"${BACKEND_LOG}" 2>&1 &
  BACKEND_PID=$!

  print_step "Launching frontend on http://localhost:5173"
  (
    cd "${ROOT_DIR}/frontend"
    npm run dev -- --host 0.0.0.0
  ) >"${FRONTEND_LOG}" 2>&1 &
  FRONTEND_PID=$!

  print_step "Narrative Atlas is starting"
  printf 'Backend log: %s\n' "${BACKEND_LOG}"
  printf 'Frontend log: %s\n' "${FRONTEND_LOG}"
  printf 'Open http://localhost:5173 once the frontend is ready.\n'

  wait "${BACKEND_PID}" "${FRONTEND_PID}"
}

main() {
  ensure_env_file

  case "${1:-auto}" in
    docker)
      run_with_docker
      ;;
    local)
      if ! local_requirements_available; then
        printf 'Local mode requires both python3 and npm on PATH.\n' >&2
        exit 1
      fi
      run_locally
      ;;
    auto)
      if docker_available; then
        run_with_docker
      elif local_requirements_available; then
        run_locally
      else
        printf 'No supported runtime found.\n' >&2
        printf 'Install Docker, or install both python3 and npm.\n' >&2
        exit 1
      fi
      ;;
    *)
      printf 'Usage: %s [auto|docker|local]\n' "$(basename "$0")" >&2
      exit 1
      ;;
  esac
}

main "$@"
