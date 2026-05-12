import React from 'react'
import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import styles from "./Dashboard.module.css"

import Logo from '../../components/Logo/Logo'
import NavButton from '../../components/Button/NavButton/NavButton'

export default function Dashboard() {

  const [active, setActive] = useState({
    overview: true,
    analisis: false,
    histori: false,
    sambungkanAkun: false,
    botKnowledge: false,
    tentangAkun: false,
    langgananBilling: false
  })

  const location = useLocation()

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <Logo/>
        <div>
          <p>DASHBOARD</p>
          <div className={styles.leftWrapper}>
            <NavButton keyword="overview"/>
          </div>
        </div>
        <div>
          <p>WORKSPACE</p>
          <div className={styles.leftWrapper}>
            <NavButton keyword="analisis" tab="workspace" />
            <NavButton keyword="histori" tab="workspace"/>
          </div>
        </div>
        <div>
          <p>INFOGRAFIS</p>
          <div className={styles.leftWrapper}>
            <NavButton keyword="buatInfografis" tab="infografis" />
            <NavButton keyword="histori" tab="infografis"/>
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <Outlet/>
      </div>
    </div>
  )
}
