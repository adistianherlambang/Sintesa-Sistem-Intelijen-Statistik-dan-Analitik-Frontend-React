import React from 'react';
import styles from './Hierarchy.module.css';

const NODE_WIDTH = 180;
const H_GAP = 320;
const V_GAP = 90;

function getTreeHeight(node) {
  if (!node || Object.keys(node).length === 0) return 1;

  return Object.values(node).reduce(
    (sum, child) => sum + getTreeHeight(child),
    0
  );
}

function wrapText(text, maxChars = 22) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
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
export default function Hierarchy({ data, width = 900, height = 600, fill, stroke, lineColor, textColor }) {
  if (!data || typeof data !== 'object') return null;

  const { nodes: rawNodes, edges } = layoutTree(data);

  if (rawNodes.length === 0) return null;

  // Calculate actual bounding box of tree to center it perfectly
  const nodeHeights = rawNodes.map(n => wrapText(n.label, 20).length * 15 + 20);
  const actualMinY = Math.min(...rawNodes.map((n, i) => n.y - nodeHeights[i] / 2));
  const actualMaxY = Math.max(...rawNodes.map((n, i) => n.y + nodeHeights[i] / 2));
  const actualTreeHeight = actualMaxY - actualMinY;

  const maxX = Math.max(...rawNodes.map(n => n.x)) + NODE_WIDTH;

  const shiftX = Math.max(0, (width - maxX) / 2);
  const shiftY = Math.max(0, (height - actualTreeHeight) / 2) - actualMinY;

  const nodes = rawNodes.map(node => ({
    ...node,
    x: node.x + shiftX,
    y: node.y + shiftY
  }));

  return (
    <div className={styles.container}>
      <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
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
              style={{ stroke: lineColor }}
              fill="none"
              markerEnd="url(#arrow)"
            />
          );
        })}

        {/* nodes */}
        {nodes.map((node) => {
          const lines = wrapText(node.label, 20);
          const nodeHeight = lines.length * 15 + 20;

          return (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y - nodeHeight / 2}
                width={NODE_WIDTH}
                height={nodeHeight}
                className={styles.nodeRect}
                style={{ fill: fill, stroke: !stroke && !fill ? "#333" : stroke && fill ? stroke : "" }}
                rx="6"
                ry="6"
              />
              <text
                x={node.x + NODE_WIDTH / 2}
                y={node.y}
                className={styles.nodeText}
                style={{ fill: textColor }}
              >
                {lines.map((line, lineIdx) => {
                  const lineHeight = 15;
                  const dy = (lineIdx - (lines.length - 1) / 2) * lineHeight;
                  return (
                    <tspan
                      key={lineIdx}
                      x={node.x + NODE_WIDTH / 2}
                      dy={lineIdx === 0 ? `${dy}px` : `${lineHeight}px`}
                    >
                      {line}
                    </tspan>
                  );
                })}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
