import React, { useRef, useEffect } from 'react';
import './background.css';

/**
 * LivingBackgroundCanvas — SmartMaze Canvas Ambient Engine Foundation
 * Renders high-DPI canvas-based environmental geometric movement.
 * Built with full resize handling, DPR scaling, reduced-motion compliance,
 * and clean unmount animation frame lifecycle.
 *
 * @param {string} mode - Ambient mode ('neutral' | 'play' | 'create' | 'lab' | 'settings')
 * @param {string} className - Additional CSS class
 */
export default function LivingBackgroundCanvas({
  mode = 'neutral',
  className = '',
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Handle high-DPI resize
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation state ticker & frame throttle
    let tick = 0;
    let lastTime = performance.now();

    const render = (now) => {
      // Throttle canvas rendering to ~30-60 FPS delta lock for optimal GPU efficiency
      if (now - lastTime < 24) {
        if (!prefersReducedMotion) {
          animFrameRef.current = requestAnimationFrame(render);
        }
        return;
      }
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Subtle architectural ambient grid foundation (Step 3 neutral baseline)
      const gridSize = 140;
      const cols = Math.ceil(width / gridSize) + 1;
      const rows = Math.ceil(height / gridSize) + 1;

      // Calculate slow wave opacity offsets based on mode
      const time = tick * 0.008;

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(216, 205, 184, 0.022)';
      ctx.beginPath();

      // Render subtle line structure batched into a single path
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;

          // Small intersection crosshair baseline
          ctx.moveTo(x - 4, y);
          ctx.lineTo(x + 4, y);
          ctx.moveTo(x, y - 4);
          ctx.lineTo(x, y + 4);
        }
      }
      ctx.stroke();

      tick++;

      // Continue animation loop unless reduced motion is active
      if (!prefersReducedMotion) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    // Initial render call
    animFrameRef.current = requestAnimationFrame(render);

    // Cleanup listeners and animation frame on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [mode]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`smartmaze-bg-canvas ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
