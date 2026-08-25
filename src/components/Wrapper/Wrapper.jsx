import React from 'react'
import styles from "./Wrapper.module.css"

export default function Wrapper({ width, height, padding, children, onClick, style, hoverable, className, bgColor, color, border }) {
  const isClickable = typeof onClick === 'function';
  const shouldHover = hoverable !== undefined ? hoverable : isClickable;

  return (
    <div
      style={{
        width: width,
        height: height,
        padding: padding ? padding : "16px",
        cursor: isClickable ? 'pointer' : 'default',
        ...style,
        color: color,
        backgroundColor: bgColor
      }}
      onClick={onClick}
      className={`${styles.container} ${shouldHover ? '' : styles.noHover} ${className || ''}`}
    >
      {children}
    </div>
  );
}

//width & height isi fill atau angka spesifik misal width={12rem} atau width={fill}