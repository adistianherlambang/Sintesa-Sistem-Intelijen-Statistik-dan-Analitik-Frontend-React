import React from "react";
import styles from "./Checkbox.module.css";

export default function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = "",
  style,
  id,
  name,
  ...props
}) {
  const handleClick = () => {
    if (disabled) return;
    if (onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`${styles.container} ${checked ? styles.containerActive : ""} ${
        disabled ? styles.disabled : ""
      } ${className}`.trim()}
      onClick={handleClick}
      style={style}
    >
      <div className={`${styles.box} ${checked ? styles.boxActive : ""}`}>
        {checked && <span className={styles.checkIcon}>✓</span>}
      </div>
      {label && <span className={styles.label}>{label}</span>}
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {}}
        disabled={disabled}
        id={id}
        name={name}
        className={styles.hiddenInput}
        aria-hidden="true"
        tabIndex={-1}
        {...props}
      />
    </div>
  );
}
