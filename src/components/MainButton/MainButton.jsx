import React from "react";
import styles from "./MainButton.module.css";

export default function MainButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  style = {}
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.button} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}