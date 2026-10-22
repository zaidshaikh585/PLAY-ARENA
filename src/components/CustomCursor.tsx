import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'action'>('default');
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Detect touch / mobile
    const checkTouch = () => {
      if (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      ) {
        setIsTouchDevice(true);
      }
    };
    checkTouch();

    const handleMouseMove = (e: MouseEvent) => {
      setTargetPos({ x: e.clientX, y: e.clientY });

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, select, textarea, [data-interactive="true"]');
        if (interactive) {
          setIsHovering(true);
          const isAction = target.closest('[data-cursor="action"]');
          setCursorType(isAction ? 'action' : 'pointer');
        } else {
          setIsHovering(false);
          setCursorType('default');
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Smooth mechanical stabilization lerp for scope outer reticle
    const smoothFollow = () => {
      setPos((prev) => {
        const ease = 0.22;
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        return {
          x: prev.x + dx * ease,
          y: prev.y + dy * ease,
        };
      });
      requestRef.current = requestAnimationFrame(smoothFollow);
    };

    requestRef.current = requestAnimationFrame(smoothFollow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [targetPos.x, targetPos.y]);

  if (isTouchDevice) return null;

  const isTargetLocked = isHovering || cursorType === 'action';

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* SCOPE STABILIZED OUTER HOUSING */}
      <div
        className="fixed top-0 left-0 transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
        }}
      >
        {/* Scope Optical Ring */}
        <div
          className={`relative rounded-full transition-all duration-200 ease-out flex items-center justify-center ${
            cursorType === 'action'
              ? 'w-14 h-14 border-2 border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(255,0,127,0.6)]'
              : isTargetLocked
              ? 'w-12 h-12 border-2 border-cyan-400 bg-cyan-400/10 shadow-[0_0_18px_rgba(0,240,255,0.5)] rotate-45'
              : 'w-10 h-10 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.25)]'
          } ${isClicking ? 'scale-75 brightness-150' : ''}`}
        >
          {/* Tactical Crosshair Scope Lines (Top, Bottom, Left, Right) */}
          {/* Top vertical stadia line */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] transition-all duration-150 ${
              isTargetLocked ? 'h-3 bg-pink-400' : 'h-2.5 bg-cyan-400'
            }`}
          />
          {/* Bottom vertical stadia line */}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] transition-all duration-150 ${
              isTargetLocked ? 'h-3 bg-pink-400' : 'h-2.5 bg-cyan-400'
            }`}
          />
          {/* Left horizontal stadia line */}
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] transition-all duration-150 ${
              isTargetLocked ? 'w-3 bg-pink-400' : 'w-2.5 bg-cyan-400'
            }`}
          />
          {/* Right horizontal stadia line */}
          <div
            className={`absolute right-0 top-1/2 -translate-y-1/2 h-[1.5px] transition-all duration-150 ${
              isTargetLocked ? 'w-3 bg-pink-400' : 'w-2.5 bg-cyan-400'
            }`}
          />

          {/* Inner Rangefinder Aperture Ring */}
          <div
            className={`rounded-full border border-dashed transition-all duration-150 ${
              isTargetLocked
                ? 'w-6 h-6 border-pink-400/80 animate-spin'
                : 'w-5 h-5 border-cyan-400/40'
            }`}
            style={{ animationDuration: '6s' }}
          />

          {/* Scope Corner Range Brackets on Lock-On */}
          {isTargetLocked && (
            <>
              <div className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-pink-400" />
              <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-pink-400" />
              <div className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-pink-400" />
              <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-pink-400" />
            </>
          )}
        </div>

        {/* Lock Telemetry Readout Below Scope */}
        {isTargetLocked && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-widest font-black uppercase whitespace-nowrap text-cyan-300 drop-shadow-[0_0_6px_#00F0FF]">
            {cursorType === 'action' ? 'TARGET LOCKED' : 'AIM ACQUIRED'}
          </div>
        )}
      </div>

      {/* ZERO-LATENCY PRECISE CENTER AIM DOT */}
      <div
        className="fixed top-0 left-0 transition-transform duration-0 pointer-events-none"
        style={{
          transform: `translate3d(${targetPos.x}px, ${targetPos.y}px, 0) translate(-50%, -50%)`,
        }}
      >
        {/* Precise Crosshair Dot */}
        <div
          className={`rounded-full transition-all duration-75 ${
            isTargetLocked
              ? 'w-2 h-2 bg-pink-400 shadow-[0_0_10px_#FF007F]'
              : 'w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_8px_#00F0FF]'
          } ${isClicking ? 'scale-150 bg-white shadow-[0_0_15px_#FFFFFF]' : ''}`}
        />

        {/* Recoil Flash Burst on Click */}
        {isClicking && (
          <div className="absolute inset-0 -m-3 w-7 h-7 rounded-full border border-cyan-300 animate-ping opacity-80" />
        )}
      </div>
    </div>
  );
};
