## UI

![Alt text](image.png)

## Install Chainlit and OpenAI

```shell
pip install -U chainlit openai
```

## Start the Chainlit server

Create a `./chainlit-backend/.env` file:

```.env
OPENAI_API_KEY=YOUR_KEY
```
### Venv setup
`.\venv\Scripts\activate`

Start the server in headless mode:

```shell
cd ./chainlit-backend
chainlit run app.py -h
```

## Start the React app

```shell
cd ./frontend
npm i
npm run dev
```
