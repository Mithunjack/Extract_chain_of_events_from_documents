import { useEffect, useState } from "react";

import { useChatSession } from "@chainlit/react-client";
import Playground from "./components/playground";
import EventGraph from "./components/eventGraph";

const CHAINLIT_SERVER = "http://localhost:8000";
const userEnv = {};

interface ListItem {
  time: string;
  title: string;
  body: string;
}

function App() {
  const { connect } = useChatSession();
  const [listData, setListData] = useState<ListItem[]>([]); // Specify the type here

  useEffect(() => {
    connect({ wsEndpoint: CHAINLIT_SERVER, userEnv });
  }, [connect]);

  return (
    <>
      <div className="flex flex-row">
        <Playground />
        <EventGraph listData={listData} />
      </div>
    </>
  );
}

export default App;
