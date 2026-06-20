import React, { useState, useEffect } from 'react';

export default function AILoader({ text = "Sedang diproses oleh AI Agent...", minHeight = "200px" }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    setDisplayedText(""); // Reset displayed text
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, 45); // Typing speed: 45ms per character
    return () => clearInterval(timer);
  }, [text]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: minHeight,
      width: '100%',
      color: '#fff',
      gap: '20px',
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '8px',
      background: 'rgba(52, 179, 74, 0.02)',
      border: '1px solid rgba(52, 179, 74, 0.05)',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        zIndex: 2,
        maxWidth: '85%',
        textAlign: 'center'
      }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          fontWeight: '500',
          letterSpacing: '0.5px',
          color: '#34B34A',
          fontFamily: "Fira Code, Source Code Pro, Consolas, Monaco, 'Courier New', Courier, monospace",
          textShadow: '0 0 8px rgba(52, 179, 74, 0.4)'
        }}>
          {displayedText}
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '15px',
            marginLeft: '4px',
            backgroundColor: '#34B34A',
            verticalAlign: 'middle',
            animation: 'blinkCursor 0.8s step-end infinite',
            boxShadow: '0 0 6px #34B34A'
          }} />
        </p>
      </div>

      <style>{`
        @keyframes blinkCursor {
          from, to { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
