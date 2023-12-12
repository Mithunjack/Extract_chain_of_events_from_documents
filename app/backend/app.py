import os
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers  import StrOutputParser
from langchain_core.runnables import Runnable
from langchain_core.runnables.config import RunnableConfig
from prompts import basic_event_prompt_template, event_instruction_template

import chainlit as cl

settings = {
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0,
}


@cl.on_chat_start
async def on_chat_start():
    model = ChatOpenAI(streaming=True, openai_api_key=os.environ["OPENAI_API_KEY"])
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                event_instruction_template
            ),
            ("human", "{question}"),
        ]
    )
    output_parser = StrOutputParser()
    runnable: Runnable = prompt | model | output_parser
    cl.user_session.set("runnable", runnable)


@cl.on_message
async def on_message(message: cl.Message):
    runnable = cl.user_session.get("runnable")  # type: Runnable

    msg = cl.Message(content="")
    print(message.content)
    async for chunk in runnable.astream(
        {"question": message.content},
        config=RunnableConfig(callbacks=[cl.LangchainCallbackHandler()]),
    ):
        await msg.stream_token(chunk)

    await msg.send()
