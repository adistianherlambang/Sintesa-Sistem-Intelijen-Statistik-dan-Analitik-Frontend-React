import React from "react";
import styles from "./Radio.module.css";

export default function Radio({
  checked = false,
  onChange,
  label,
  value,
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
      onChange(value !== undefined ? value : !checked);
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
      <div className={`${styles.circle} ${checked ? styles.circleActive : ""}`}>
        {checked && <span className={styles.dot}></span>}
      </div>
      {label && <span className={styles.label}>{label}</span>}
      <input
        type="radio"
        checked={checked}
        onChange={() => {}}
        disabled={disabled}
        value={value}
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
