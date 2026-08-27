import { useState } from "react";
import styles from "./Input.module.css";

export default function Input({
  value,
  setValue,
  type = "text",
  placeholder = "",
  disabled = false,
  ...props
}) {
  const [internalValue, setInternalValue] = useState("");

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e) => {
    if (typeof setValue === "function") {
      setValue(e.target.value);
    } else {
      setInternalValue(e.target.value);
    }
  };

  return (
    <input
      className={styles.input}
      type={type}
      value={currentValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      {...props}
    />
  );
}