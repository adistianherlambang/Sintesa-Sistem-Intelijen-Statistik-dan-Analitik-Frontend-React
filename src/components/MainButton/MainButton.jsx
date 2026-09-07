import React from "react";
import Button from "../Button/Button";

export default function MainButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  size = "lg",
  fullWidth = true,
  className = "",
  title,
  ...props
}) {
  return (
    <Button
      type={type}
      disabled={disabled}
      onClick={onClick}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      title={title}
      {...props}
    >
      {children}
    </Button>
  );
}