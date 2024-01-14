import os
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers  import StrOutputParser
from langchain_core.runnables import Runnable, RunnablePassthrough
from langchain_core.runnables.config import RunnableConfig
from langchain.vectorstores import chroma
from langchain.document_loaders.pdf import PyPDFDirectoryLoader
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from prompts import event_instruction_template

import chainlit as cl

settings = {
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0,
}

DATA_PATH="data/"
DB_PATH = "vectorstores/db/"

def index_vector_db():
    loader = PyPDFDirectoryLoader(DATA_PATH)
    documents = loader.load()
    print(f"Processed {len(documents)} pdf files")
    print(documents)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=50)
    texts=text_splitter.split_documents(documents)
    print('texts', texts)
    vectorstore = chroma.Chroma.from_documents(documents=texts, embedding=OpenAIEmbeddings(model="text-embedding-ada-002"),persist_directory=DB_PATH)      
    vectorstore.persist()
    print('data saved')

@cl.on_chat_start
async def on_chat_start():
    index_vector_db()
    vectorstore = chroma.Chroma(persist_directory=DB_PATH, embedding_function=OpenAIEmbeddings(model="text-embedding-ada-002"))

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
    retriever = vectorstore.as_retriever()
    runnable: Runnable = (
        {'context': retriever,'question': RunnablePassthrough()}
        | prompt 
        | model 
        | output_parser
        )
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
