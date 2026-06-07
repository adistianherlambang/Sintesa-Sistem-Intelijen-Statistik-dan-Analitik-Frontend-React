import React from 'react';
import styles from './TreeFlow.module.css';

const NODE_WIDTH = 80;
const NODE_HEIGHT = 40;
const H_GAP = 140;
const V_GAP = 60;

function getTreeHeight(node) {
  if (!node || Object.keys(node).length === 0) return 1;

  return Object.values(node).reduce(
    (sum, child) => sum + getTreeHeight(child),
    0
  );
}

function layoutTree(data, depth = 0, startY = 0) {
  let nodes = [];
  let edges = [];
  let currentY = startY;

  Object.entries(data).forEach(([key, value], index) => {
    const nodeId = key + '_' + depth + '_' + index;

    const subtreeHeight = getTreeHeight(value) * V_GAP;
    const nodeY = currentY + subtreeHeight / 2;

    const node = {
      id: nodeId,
      label: key,
      x: depth * H_GAP,
      y: nodeY
    };

    nodes.push(node);

    if (value && Object.keys(value).length > 0) {
      Object.entries(value).forEach(([childKey], childIndex) => {
        const childId = childKey + '_' + (depth + 1) + '_' + childIndex;

        edges.push({
          from: nodeId,
          to: childId
        });
      });

      const childLayout = layoutTree(value, depth + 1, currentY);

      nodes = nodes.concat(childLayout.nodes);
      edges = edges.concat(childLayout.edges);
    }

    currentY += subtreeHeight;
  });

  return { nodes, edges };
}

export default function TreeFlow({ data, width = 900, height = 600, fill, stroke, lineColor, textColor }) {
  if (!data || typeof data !== 'object') return null;

  const { nodes, edges } = layoutTree(data);

  return (
    <div className={styles.container}>
      <svg className={styles.svg} width={width} height={height}>

        {/* edges (CURVED) */}
        {edges.map((edge, i) => {
          const from = nodes.find(n => n.id === edge.from);
          const to = nodes.find(n => n.id === edge.to);
          if (!from || !to) return null;

          const x1 = from.x + NODE_WIDTH;
          const y1 = from.y;
          const x2 = to.x;
          const y2 = to.y;

          // control point untuk curve
          const dx = (x2 - x1) / 2;

          const path = `
            M ${x1} ${y1}
            C ${x1 + dx} ${y1},
              ${x2 - dx} ${y2},
              ${x2} ${y2}
          `;

          return (
            <path
              key={i}
              d={path}
              className={styles.edge}
              style={{stroke: lineColor}}
              fill="none"
              markerEnd="url(#arrow)"
            />
          );
        })}

        {/* nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            <rect
              x={node.x}
              y={node.y - NODE_HEIGHT / 2}
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              className={styles.nodeRect}
              style={{fill: fill, stroke: !stroke && !fill ? "#333" : stroke && fill ? stroke : ""}}
              rx="6"
              ry="6"
            />
            <text
              x={node.x + NODE_WIDTH / 2}
              y={node.y}
              className={styles.nodeText}
              style={{fill: textColor}}
            >
              {node.label}
            </text>
          </g>
        ))}

      </svg>
    </div>
  );
}

{/* <TreeFlow
  data={dummyData}
  width={1200}
  height={700}
  fill={"#ffffff"}
  stroke={"#000000"}
  textColor={"#23af00"}
  lineColor={"#ff0000"}
/> */}