import React from 'react'
import { useState, useEffect } from 'react'
import styles from "./Analisis.module.css"

import Wrapper from '../../../components/Wrapper/Wrapper'

export default function Analisis() {

  return (
    <div className={styles.container}>
      <p className={styles.tabTitle}>Analisis</p>
      <Wrapper>asdia</Wrapper>
      <StepOne />
    </div>
  )
}

function StepOne() {
  return (
    <div className={styles.container}>
      <Wrapper>satu</Wrapper>
    </div>
  )
}