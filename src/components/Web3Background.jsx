import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const Web3Background = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mousePosition = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const particles = useRef([]);

  // Initialize optimized particles
  const initializeParticles = () => {
    particles.current = [];
    // Reduce particle count on mobile for better performance
    const particleCount = window.innerWidth < 768 ? 25 : 50;
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 1,
        baseSize: Math.random() * 2 + 1,
        hue: 180 + Math.random() * 60,
        baseHue: 180 + Math.random() * 60,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  };

  // Draw connections with strong mouse interaction
  const drawConnections = (ctx) => {
    for (let i = 0; i < particles.current.length; i++) {
      for (let j = i + 1; j < particles.current.length; j++) {
        const p1 = particles.current[i];
        const p2 = particles.current[j];
        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

        // Adjust connection distance for mobile
        const connectionDistance = window.innerWidth < 768 ? 80 : 100;
        if (distance < connectionDistance) {
          let opacity =
            ((connectionDistance - distance) / connectionDistance) * 0.2;

          // Strong mouse interaction
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const mouseDistance = Math.sqrt(
            (mousePosition.current.x - midX) ** 2 +
              (mousePosition.current.y - midY) ** 2
          );

          // Adjust mouse interaction radius for mobile
          const mouseRadius = window.innerWidth < 768 ? 100 : 120;
          if (mouseDistance < mouseRadius) {
            const mouseEffect = (mouseRadius - mouseDistance) / mouseRadius;
            opacity += mouseEffect * 0.8;

            // Pulsing effect
            const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
            opacity *= pulse;
          }

          ctx.strokeStyle = `hsla(${
            (p1.hue + p2.hue) / 2
          }, 80%, 70%, ${Math.min(opacity, 1)})`;
          ctx.lineWidth = 0.5 + opacity * 3;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  };

  // Draw particles with mouse attraction/repulsion
  const drawParticles = (ctx) => {
    particles.current.forEach((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x < 0 || particle.x > ctx.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > ctx.canvas.height) particle.vy *= -1;

      // Mouse interaction - strong and responsive
      const mouseDistance = Math.sqrt(
        (mousePosition.current.x - particle.x) ** 2 +
          (mousePosition.current.y - particle.y) ** 2
      );

      if (mouseDistance < 120) {
        const force = ((120 - mouseDistance) / 120) * 0.05;
        const angle = Math.atan2(
          particle.y - mousePosition.current.y,
          particle.x - mousePosition.current.x
        );

        // Repulsion force
        particle.vx += Math.cos(angle) * force;
        particle.vy += Math.sin(angle) * force;

        // Dynamic size and color changes
        const effect = (120 - mouseDistance) / 120;
        particle.size = particle.baseSize * (1 + effect * 2);
        particle.hue = particle.baseHue + effect * 60; // Shift to purple
      } else {
        // Return to normal
        particle.size = particle.baseSize;
        particle.hue = particle.baseHue;
      }

      // Apply friction
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Enhanced pulse animation
      particle.pulse += 0.03;
      const pulse = Math.sin(particle.pulse) * 0.2 + 1;
      const finalSize = particle.size * pulse;

      // Draw particle with enhanced glow
      const nearMouse = mouseDistance < 80;
      const glowSize = nearMouse ? 15 + Math.sin(Date.now() * 0.02) * 5 : 8;

      ctx.shadowBlur = glowSize;
      ctx.shadowColor = `hsl(${particle.hue}, 80%, 60%)`;
      ctx.fillStyle = `hsl(${particle.hue}, 80%, ${nearMouse ? 85 : 70}%)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, finalSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  };

  // Draw mouse cursor effect
  const drawMouseEffect = (ctx) => {
    const time = Date.now() * 0.005;
    const baseSize = 25;
    const pulseSize = baseSize + Math.sin(time) * 8;

    // Outer ring
    ctx.strokeStyle = `hsla(180, 80%, 60%, ${0.4 + Math.sin(time) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      mousePosition.current.x,
      mousePosition.current.y,
      pulseSize,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // Inner glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(0, 255, 255, 0.6)";
    ctx.fillStyle = `hsla(180, 80%, 70%, ${0.1 + Math.sin(time * 1.5) * 0.05})`;
    ctx.beginPath();
    ctx.arc(
      mousePosition.current.x,
      mousePosition.current.y,
      pulseSize * 0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  // Optimized animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawConnections(ctx);
    drawParticles(ctx);
    drawMouseEffect(ctx);

    animationRef.current = requestAnimationFrame(animate);
  };

  // Mouse movement handler - simplified to avoid jitter
  const handleMouseMove = (e) => {
    mousePosition.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  // Resize handler
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeParticles();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    initializeParticles();
    animate();

    // Global mouse tracking for better responsiveness
    document.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-0">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/30 to-cyan-950/20" />

      {/* Interactive canvas - high z-index for mouse capture */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-20"
        style={{ mixBlendMode: "screen", pointerEvents: "none" }}
      />

      {/* Interactive floating elements with enhanced mouse interactions */}
      <div className="absolute inset-0 overflow-hidden z-10">
        {[
          { symbol: "₿", color: "cyan", size: "text-8xl", x: 15, y: 20 },
          { symbol: "⧫", color: "blue", size: "text-7xl", x: 75, y: 35 },
          { symbol: "◊", color: "purple", size: "text-6xl", x: 25, y: 70 },
          { symbol: "⬡", color: "teal", size: "text-9xl", x: 85, y: 15 },
          { symbol: "◈", color: "indigo", size: "text-5xl", x: 65, y: 80 },
          { symbol: "⬢", color: "emerald", size: "text-6xl", x: 5, y: 50 },
        ].map((item, i) => (
          <motion.div
            key={i}
            data-web3-element
            className={`absolute ${item.size} font-bold cursor-pointer transition-all duration-300 select-none`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              color: `hsl(${180 + i * 25}, 70%, 50%)`,
              textShadow: "0 0 20px currentColor, 0 0 40px currentColor",
              filter: "drop-shadow(0 0 10px currentColor)",
            }}
            initial={{
              opacity: 0.2,
              scale: 1,
              rotate: 0,
            }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            whileHover={{
              scale: 1.5,
              opacity: 0.8,
              textShadow: "0 0 30px currentColor, 0 0 60px currentColor",
              filter: "drop-shadow(0 0 20px currentColor) brightness(1.3)",
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            whileTap={{
              scale: 1.3,
              rotate: 180,
              transition: { duration: 0.3, ease: "easeInOut" },
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            {item.symbol}
          </motion.div>
        ))}
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-3 pointer-events-none z-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
};

export default Web3Background;
