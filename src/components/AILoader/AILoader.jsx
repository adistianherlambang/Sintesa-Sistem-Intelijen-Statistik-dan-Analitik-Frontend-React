import React from 'react';

export default function AILoader({ text = "Sedang diproses oleh AI Agent...", minHeight = "200px" }) {
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
      {/* Reusable AI Agent Core Loader */}
      <div style={{
        position: 'relative',
        width: '80px',
        height: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Outer Scanner Ring */}
        <div style={{
          position: 'absolute',
          width: '76px',
          height: '76px',
          border: '2.5px dashed rgba(52, 179, 74, 0.25)',
          borderRadius: '50%',
          animation: 'rotateCW 12s linear infinite'
        }} />

        {/* Inner Scanning Arc */}
        <div style={{
          position: 'absolute',
          width: '60px',
          height: '60px',
          border: '3px solid transparent',
          borderTopColor: '#34B34A',
          borderBottomColor: '#34B34A',
          borderRadius: '50%',
          animation: 'rotateCCW 2s cubic-bezier(0.5, 0.2, 0.3, 0.8) infinite',
          boxShadow: '0 0 10px rgba(52, 179, 74, 0.15)'
        }} />

        {/* Central Core */}
        <div style={{
          width: '28px',
          height: '28px',
          background: 'radial-gradient(circle, #85e096 0%, #34B34A 70%, #1c6628 100%)',
          borderRadius: '50%',
          boxShadow: '0 0 15px #34B34A, 0 0 30px rgba(52, 179, 74, 0.5), inset 0 0 6px rgba(255, 255, 255, 0.8)',
          animation: 'pulseCore 1.3s ease-in-out infinite'
        }} />

        {/* Scan line overlay */}
        <div style={{
          position: 'absolute',
          width: '40px',
          height: '1.5px',
          background: 'rgba(255, 255, 255, 0.7)',
          boxShadow: '0 0 6px #fff, 0 0 12px #34B34A',
          animation: 'scanLine 2s ease-in-out infinite'
        }} />
      </div>

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
          fontSize: '14px',
          fontWeight: '500',
          letterSpacing: '1px',
          color: 'rgba(255, 255, 255, 0.85)',
          animation: 'shimmerText 2s ease-in-out infinite'
        }}>
          {text}
        </p>
        <div style={{
          display: 'flex',
          gap: '4px',
          marginTop: '2px'
        }}>
          <span style={{ width: '5px', height: '5px', backgroundColor: '#34B34A', borderRadius: '50%', animation: 'dotPulse 1.2s infinite 0s' }} />
          <span style={{ width: '5px', height: '5px', backgroundColor: '#34B34A', borderRadius: '50%', animation: 'dotPulse 1.2s infinite 0.2s' }} />
          <span style={{ width: '5px', height: '5px', backgroundColor: '#34B34A', borderRadius: '50%', animation: 'dotPulse 1.2s infinite 0.4s' }} />
        </div>
      </div>

      <style>{`
        @keyframes rotateCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rotateCCW {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pulseCore {
          0%, 100% { transform: scale(0.9); opacity: 0.8; box-shadow: 0 0 12px #34B34A, 0 0 25px rgba(52, 179, 74, 0.35); }
          50% { transform: scale(1.15); opacity: 1; box-shadow: 0 0 25px #34B34A, 0 0 50px rgba(52, 179, 74, 0.7); }
        }
        @keyframes scanLine {
          0%, 100% { transform: translateY(-20px); opacity: 0; }
          50% { opacity: 1; }
          60% { opacity: 1; }
          99% { transform: translateY(20px); opacity: 0; }
        }
        @keyframes shimmerText {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(0.6); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
