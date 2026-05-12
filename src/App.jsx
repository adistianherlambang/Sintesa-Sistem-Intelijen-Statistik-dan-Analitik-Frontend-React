import React from 'react';
import { Router, Route } from 'react-router-dom';
import TreeFlow from './components/TreeFlow';
import dummyData from './data/dummy.json';

export default function App() {

  return (
    <>
    <TreeFlow
      data={dummyData}
      width={1200}
      height={700}
      fill={"#ffffff"}
      stroke={"#000000"}
      textColor={"#23af00"}
      lineColor={"#ff0000"}
    />
    </>
  );
}