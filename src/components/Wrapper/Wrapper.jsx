import React from 'react'
import styles from "./Wrapper.module.css"

export default function Wrapper({width, height, padding, children}) {
  return (
    <div style={{width: width, height: height, padding: padding ? padding : "16px"}} className={styles.container}>{children}</div>
  )
}

//width & height isi fill atau angka spesifik misal width={12rem} atau width={fill}