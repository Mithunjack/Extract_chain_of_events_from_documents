import { useState } from 'react';
import  EventGraph  from './eventGraph';
import  Playground  from './playground';

export default function GraphFlow() {
  const [listData, setListData] = useState([]);

  return (
    <div>
      <Playground setListData={setListData} />
      <EventGraph listData={listData} setListData={setListData} />
    </div>
  );
}
