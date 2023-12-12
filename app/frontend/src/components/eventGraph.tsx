import React from 'react';
import { Timeline } from 'flowbite-react';
import { HiCalendar } from 'react-icons/hi';

interface TimelineItem {
  time: string;
  title: string;
  body: string;
}

interface EventGraphProps {
  listData: TimelineItem[];
}

const EventGraph: React.FC<EventGraphProps> = ({ listData }) => {
  return (
    <div className="mt-10 ml-10 w-30">
      <Timeline>
        {listData.map((item, index) => (
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
