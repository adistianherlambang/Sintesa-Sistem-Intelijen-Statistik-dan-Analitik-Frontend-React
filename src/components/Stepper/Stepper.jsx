import { useState, useEffect } from "react";
import styles from "./Stepper.module.css"

export default function Stepper({ item }) {

  const [step, setStep] = useState(0)
  const CurrentContent = item[step].content

  return (
    <div className={styles.container}>
      <div className={styles.stepperContainer}>
        {item.map((stepItem, index) => (
          <div
            className={styles.stepperWrapper}
            key={index}
          >
            <div
              className={styles.stepper}
              style={{
                backgroundColor:
                  index < step ? "blue" :
                    index === step ? "red" : ""
              }}
            >
              {index + 1}
            </div>

            {index !== item.length - 1 && (
              <div className={styles.stepperLine} />
            )}
          </div>
        ))}
      </div>
      <CurrentContent setStep={setStep} />
    </div>
  )
}