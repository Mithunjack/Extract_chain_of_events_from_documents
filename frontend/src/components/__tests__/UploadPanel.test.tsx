import { render, screen } from "@testing-library/react";

import App from "../../App";

test("renders the compact narrative workspace shell", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: /Narrative workspace/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/Narrative workspace/i)).toBeInTheDocument();
  expect(screen.getByText(/Ask anything about the document/i)).toBeInTheDocument();
});
