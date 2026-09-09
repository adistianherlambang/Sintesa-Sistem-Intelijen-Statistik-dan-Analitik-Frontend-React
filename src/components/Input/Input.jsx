import { useState } from "react";
import styles from "./Input.module.css";

export default function Input({
  value,
  setValue,
  type = "text",
  placeholder = "",
  disabled = false,
  className = "",
  ...props
}) {
  const [internalValue, setInternalValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e) => {
    if (typeof setValue === "function") {
      setValue(e.target.value);
    } else {
      setInternalValue(e.target.value);
    }
  };

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={styles.inputWrapper}>
      <input
        className={`${styles.input} ${isPassword ? styles.passwordInput : ""} ${className}`.trim()}
        type={inputType}
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          className={styles.eyeButton}
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex="-1"
          title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        >
          {showPassword ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}