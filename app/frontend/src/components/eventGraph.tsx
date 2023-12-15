import { Timeline } from 'flowbite-react';
import { HiCalendar } from 'react-icons/hi';

import {
  useChatMessages,
  useChatData,
} from "@chainlit/react-client";

const EventGraph = () => {

  const { messages } = useChatMessages();

  const { loading } = useChatData();


  let temp = [];
  const allmessages = !loading ? messages.filter((message) => message.author !== "user"): [];

  
  if(allmessages.length !== 0){
    console.log(allmessages[0].content);
    temp = JSON.parse(allmessages[0].content?.toString() || "");
    console.log(temp);
  }
  
  return (
    <div className="mt-10 ml-10 w-30">
      <Timeline>
        { temp.map((item, index) => (
          <Timeline.Item key={index}>
            <Timeline.Point icon={HiCalendar} />
            <Timeline.Content>
              <Timeline.Time>{item.time}</Timeline.Time>
              <Timeline.Title>{item.title}</Timeline.Title>
              <Timeline.Body>{item.body}</Timeline.Body>
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default EventGraph;
