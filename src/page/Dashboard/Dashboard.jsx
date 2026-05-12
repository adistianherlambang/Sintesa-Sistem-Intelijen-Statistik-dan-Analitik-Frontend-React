import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import styles from "./Dashboard.module.css"

import Logo from '../../components/Logo/Logo'
import NavButton from '../../components/Button/NavButton/NavButton'

export default function Dashboard() {

  const location = useLocation()

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <Logo/>
        <div>
          <p>DASHBOARD</p>
          <div className={styles.leftWrapper}>
            <NavButton keyword="overview" />
          </div>
        </div>
        <div>
          <p>WORKSPACE</p>
          <div className={styles.leftWrapper}>
            <NavButton keyword="analisis" />
            <NavButton keyword="histori" />
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <div style={{height: "200vh", backgroundColor: "blue"}}></div>
        <div style={{height: "200vh", backgroundColor: "white"}}></div>
      </div>
    </div>
  )
}
