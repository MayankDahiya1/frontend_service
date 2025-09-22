/*
 * IMPORTS
 */
import React, { useEffect, useRef } from "react";

/*
 * COMPONENT
 */
const CursorFollow = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // Smooth follow animation using requestAnimationFrame
    const animate = () => {
      // Lerp for smooth following (adjust 0.15 for speed - lower = smoother)
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;

      // Center the cursor by offsetting by half its size (10px)
      cursor.style.transform = `translate(${cursorX - 10}px, ${
        cursorY - 10
      }px)`;
      requestAnimationFrame(animate);
    };

    const updateCursorPosition = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseEnter = (e) => {
      // Check if hovering over clickable elements
      const isClickable = e.target.closest(
        'button, a, input, textarea, select, [role="button"], [tabindex], .hover-target'
      );
      if (isClickable) {
        cursor.classList.add("hover");
      }
    };

    const handleMouseLeave = (e) => {
      // Only remove hover if not moving to another clickable element
      const isClickable = e.relatedTarget?.closest(
        'button, a, input, textarea, select, [role="button"], [tabindex], .hover-target'
      );
      if (!isClickable) {
        cursor.classList.remove("hover");
      }
    };

    const handleMouseDown = () => {
      cursor.classList.add("click");
    };

    const handleMouseUp = () => {
      cursor.classList.remove("click");
    };

    // Start animation loop
    animate();

    // Add event listeners with passive for better performance
    document.addEventListener("mousemove", updateCursorPosition, {
      passive: true,
    });
    document.addEventListener("mouseover", handleMouseEnter, { passive: true });
    document.addEventListener("mouseout", handleMouseLeave, { passive: true });
    document.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("mouseup", handleMouseUp, { passive: true });

    return () => {
      document.removeEventListener("mousemove", updateCursorPosition);
      document.removeEventListener("mouseover", handleMouseEnter);
      document.removeEventListener("mouseout", handleMouseLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="cursor-follow"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

export default CursorFollow;
