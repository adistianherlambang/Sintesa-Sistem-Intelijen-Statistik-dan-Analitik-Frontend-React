import React from 'react'
import styles from "./MainButton.module.css"

export default function MainButton({children, width}) {
  return (
    <div className={styles.container}>{children}</div>
  )
}