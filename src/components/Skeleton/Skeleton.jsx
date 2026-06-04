import React from 'react'
import styles from "./Skeleton.module.css"

export default function Skeleton({width, height}) {
  const customStyle = {};
  if (width) customStyle.width = width;
  if (height) customStyle.height = height;

  return (
    <div className={styles.skeleton} style={customStyle}></div>
  )
}