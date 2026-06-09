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
              onClick={() => {
                if (index <= step) {
                  setStep(index);
                }
              }}
              className={styles.stepper}
              style={{
                opacity: index <= step ? 1 : ""
              }}
            >
              {index + 1}
            </div>

            {index !== item.length - 1 && (
              <div
                className={styles.stepperLine}
                style={{ opacity: index < step ? 1 : "" }}
              />
            )}
          </div>
        ))}
      </div>
      <CurrentContent setStep={setStep} />
    </div>
  )
}