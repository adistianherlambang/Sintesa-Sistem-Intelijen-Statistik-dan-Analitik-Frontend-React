import React from 'react'
import { useState, useEffect } from 'react'
import styles from "./HistoriWorkspace.module.css"

//component
import Wrapper from '../../../components/Wrapper/Wrapper'
import HitoriAnalisis from '../../../components/FromPage/Overview/HitoriAnalisis'

export default function HistoriWorkspace() {
  return (
    <div className={styles.container}>
      <p className={styles.tabTitle}>Histori Workspace</p>

      <div className={styles.containerr}>
        <div className={styles.wrapper}>
          <Wrapper><HitoriAnalisis /></Wrapper>
        </div>
      </div>
    </div>
  )
}
