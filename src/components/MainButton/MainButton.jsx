import { useState, useEffect } from "react";

export default function MainButton({ children, onClick }) {
  return (
    <div onClick={onClick}>{children}</div>
  )
}