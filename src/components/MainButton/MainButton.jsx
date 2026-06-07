import { useState, useEffect } from "react";

export default function MainButton({ children, onClick }) {
  return (
    <div onClick={onClick} style={{
      backgroundColor: "#34B34A",
      color: "white",
      height: "32px",
      borderRadius: "4px",
      display: "flex",
      gap: "0.5rem",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      padding: "4px 1rem"
    }}>{children}</div>
  )
}