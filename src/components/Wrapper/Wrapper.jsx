import React from 'react'
import styles from "./Wrapper.module.css"

export default function Wrapper({width, height, children}) {
  return (
    <div className={styles.container}>{children}</div>
  )
}

//width & height isi fill atau angka spesifik misal width={12rem} atau width={fill}