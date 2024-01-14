import { useState, useEffect } from 'react';
import { Timeline } from 'flowbite-react';
import { HiCalendar } from 'react-icons/hi';
import {
  useChatMessages,
  useChatData,
} from "@chainlit/react-client";

const EventGraph = () => {
  const { messages } = useChatMessages();
  const { loading } = useChatData();

  const [eventData, setEventData] = useState([]);

  useEffect(() => {
    if (!loading) {
      const filteredMessages = messages.filter(message => message.author !== "user");
      if (filteredMessages.length !== 0) {
        try {
          const latestMessage = JSON.parse(filteredMessages[0].content?.toString() || "");
          setEventData(latestMessage);
        } catch (error) {
          console.error('Error parsing message content:', error);
        }
      }
    }
  }, [messages, loading]); // Dependency array includes messages and loading

  return (
    <div className="m-4 w-30 max-w-sm p-2">
      <Timeline>
        {eventData.map((item, index) => (
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
