'use client';

import { useEffect, useRef } from 'react';

export default function BreathingOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const baseRadius = Math.min(w, h) * 0.42;

      // Base sphere: black core with a silver rim-light gradient.
      const sphereGradient = ctx.createRadialGradient(
        cx - baseRadius * 0.3,
        cy - baseRadius * 0.35,
        baseRadius * 0.1,
        cx,
        cy,
        baseRadius
      );
      sphereGradient.addColorStop(0, '#4a4a4a');
      sphereGradient.addColorStop(0.45, '#1c1c1c');
      sphereGradient.addColorStop(0.8, '#050505');
      sphereGradient.addColorStop(1, '#000000');

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGradient;
      ctx.fill();

      // Silver rim highlight, like light catching the edge.
      const rimGradient = ctx.createRadialGradient(cx, cy, baseRadius * 0.85, cx, cy, baseRadius);
      rimGradient.addColorStop(0, 'rgba(220, 224, 230, 0)');
      rimGradient.addColorStop(0.9, 'rgba(200, 205, 212, 0.35)');
      rimGradient.addColorStop(1, 'rgba(180, 185, 195, 0.55)');
      ctx.fillStyle = rimGradient;
      ctx.fill();
      ctx.restore();

      // Voice waveform rings, pulsing outward like the orb is "speaking."
      const ringCount = 4;
      for (let i = 0; i < ringCount; i++) {
        const phase = (time * 0.6 + i / ringCount) % 1;
        const amplitude = Math.sin(time * 2 + i) * 0.5 + 0.5;
        const ringRadius = baseRadius * (0.55 + phase * 0.5);
        const alpha = (1 - phase) * 0.4 * (0.4 + amplitude * 0.6);

        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(210, 214, 220, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Inner waveform bars across the equator, like an audio visualizer.
      const barCount = 28;
      const barSpan = baseRadius * 1.5;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 0.98, 0, Math.PI * 2);
      ctx.clip();
      for (let i = 0; i < barCount; i++) {
        const x = cx - barSpan / 2 + (barSpan / barCount) * i;
        const wave =
          Math.sin(time * 3 + i * 0.5) * 0.5 +
          Math.sin(time * 5 + i * 0.3) * 0.3 +
          0.5;
        const barHeight = baseRadius * 0.5 * Math.max(0.15, wave);
        const alpha = 0.5 + wave * 0.3;

        ctx.fillStyle = `rgba(225, 228, 233, ${alpha})`;
        ctx.fillRect(x, cy - barHeight / 2, 2, barHeight);
      }
      ctx.restore();

      time += 0.02;
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}
