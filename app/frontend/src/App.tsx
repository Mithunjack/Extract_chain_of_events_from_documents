import { useEffect } from "react";

import { useChatSession } from "@chainlit/react-client";
import Playground from "./components/playground";
import EventGraph from "./components/eventGraph";

const CHAINLIT_SERVER = "http://localhost:8000";
const userEnv = {};


function App() {
  const { connect } = useChatSession();

  useEffect(() => {
    connect({ wsEndpoint: CHAINLIT_SERVER, userEnv });
  }, [connect]);

  return (
    <>
      <div className="flex flex-row">
        <Playground />
        <EventGraph />
      </div>
    </>
  );
}

export default App;
