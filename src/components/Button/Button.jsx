import React from "react";
import styles from "./Button.module.css";

export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary", // "primary" | "secondary" | "danger"
  size = "md",         // "sm" | "md" | "lg"
  fullWidth = false,
  className = "",
  title,
  ...props
}) {
  const variantClass = styles[variant] || styles.primary;
  const sizeClass = styles[size] || styles.md;
  const widthClass = fullWidth ? styles.fullWidth : "";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`${styles.button} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
