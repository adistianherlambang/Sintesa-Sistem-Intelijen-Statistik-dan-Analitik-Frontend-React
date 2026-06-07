import React from 'react'
import { useState, useEffect } from 'react'
import styles from "./Analisis.module.css"

// component
import Stepper from '../../../components/Stepper/Stepper'
import Wrapper from '../../../components/Wrapper/Wrapper'

export default function Analisis() {

  const [state, setState] = useState("")

  const item = [
    { label: "StepOne", content: StepOne },
    { label: "StepTwo", content: StepTwo },
    { label: "StepThree", content: StepThree },
  ]

  return (
    <div className={styles.container}>
      <p className={styles.tabTitle}>Analisis</p>
      <Wrapper>asdia</Wrapper>
      <Stepper item={item} />
    </div>
  )
}

function StepOne(props) {

  const { setStep } = props

  return (
    <div className={styles.container}>
      <Wrapper>satu</Wrapper>
      <div onClick={() => setStep(1)}>klik</div>
    </div>
  )
}

function StepTwo(props) {

  const { setStep } = props

  return (
    <div className={styles.container}>
      <Wrapper>dua</Wrapper>
      <div onClick={() => setStep(2)}>klik</div>
    </div>
  )
}

function StepThree(props) {

  const { setStep } = props

  return (
    <div className={styles.container}>
      <Wrapper>tiga</Wrapper>
      <div onClick={() => setStep(0)}>klik</div>
    </div>
  )
}