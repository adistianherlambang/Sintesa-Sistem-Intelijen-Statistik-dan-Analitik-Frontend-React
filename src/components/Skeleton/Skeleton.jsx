import React from 'react'
import styles from "./Skeleton.module.css"

export default function Skeleton({width, height}) {
  return (
    <div style={{
      height: height,
      width: width
    }} className={styles.skeleton}></div>
  )
}
