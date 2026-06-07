import { useState, useEffect } from "react";
import styles from "./Stepper.module.css"

export default function Stepper({ item }) {

  const [step, setStep] = useState(0)
  const CurrentContent = item[step].content

  return (
    <div>
      <div>{step}</div>
      <CurrentContent setStep={setStep} />
    </div>
  )
}