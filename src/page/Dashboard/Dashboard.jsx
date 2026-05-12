import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import styles from "./Dashboard.module.css"

import Logo from '../../components/Logo/Logo'

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <Logo/>
      </div>
      <div className={styles.right}>
        ah
      </div>
    </div>
  )
}
