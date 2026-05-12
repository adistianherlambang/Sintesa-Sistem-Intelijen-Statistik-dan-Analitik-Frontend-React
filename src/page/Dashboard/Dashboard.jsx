import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import styles from "./Dashboard.module.css"

import Logo from '../../components/Logo/Logo'

export default function Dashboard() {

  const location = useLocation() 

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <Logo/>
        
      </div>
      <div className={styles.right}>
        <div style={{height: "200vh", backgroundColor: "blue"}}></div>
        <div style={{height: "200vh", backgroundColor: "white"}}></div>
      </div>
    </div>
  )
}
