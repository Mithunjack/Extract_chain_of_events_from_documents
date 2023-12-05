import { Button, Timeline } from 'flowbite-react';
import { HiArrowNarrowRight, HiCalendar } from 'react-icons/hi';
import { useState } from 'react';

export default function EventGraph() {
  
  const [listData, setListData] = useState([{
    time: 'February 2022',
    title: 'Application UI code in Tailwind CSS',
    body: 'Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.',
  },
  {
    time: 'March 2022',
    title: 'Marketing UI design in Figma',
    body: 'All of the pages and components are first designed in Figma and we keep a parity between the two versions even as we update the project.',
  },
  {
    time: 'April 2022',
    title: 'E-Commerce UI code in Tailwind CSS',
    body: 'Get started with dozens of web components and interactive elements built on top of Tailwind CSS.',
  },
]);


  return (
    <div className='mt-10 ml-10 w-30'>
      <Timeline>
        {
          listData.map((item, index) => (
            <Timeline.Item key={index}>
              <Timeline.Point icon={HiCalendar} />
              <Timeline.Content>
                <Timeline.Time>{item.time}</Timeline.Time>
                <Timeline.Title>{item.title}</Timeline.Title>
                <Timeline.Body>{item.body}</Timeline.Body>
              </Timeline.Content>
            </Timeline.Item>
          ))
        }
      </Timeline>
    </div>
  );
}