"use client";

import { useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

/**
 * Special Relativity Visualizer showing:
 * - Light clock thought experiment
 * - Time dilation and length contraction
 * - Speed of light as universal constant
 */
export function SpecialRelativityVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [velocity, setVelocity] = useState(0.6); // as fraction of c
  const [showContraction, setShowContraction] = useState(true);
  const [mode, setMode] = useState<"light-clock" | "length-contraction">("light-clock");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    let time = 0;
    let frameCount = 0;

    const lorentzFactor = (v: number) => 1 / Math.sqrt(1 - v * v);
    const timeDilation = (v: number) => lorentzFactor(v);
    const lengthContraction = (v: number) => Math.sqrt(1 - v * v);

    const render = () => {
      time += 0.02;
      frameCount += 1;

      // Clear background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      if (mode === "light-clock") {
        // Title
        ctx.fillStyle = "#fff";
        ctx.font = "16px sans-serif";
        ctx.fillText("Light Clock: Time Dilation in Special Relativity", 20, 30);
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "#888";
        ctx.fillText(
          "Light bounces between two mirrors. In a moving frame, the light path is diagonal, so time runs slower.",
          20,
          50,
        );

        // Rest frame (stationary)
        const restX = 150;
        const restY = 150;
        const clockHeight = 100;
        const clockWidth = 40;

        ctx.fillStyle = "#aaa";
        ctx.font = "12px sans-serif";
        ctx.fillText("Rest Frame (v = 0)", restX, restY - 20);

        // Draw mirrors
        ctx.fillStyle = "#444";
        ctx.fillRect(restX - clockWidth / 2, restY - clockHeight / 2, clockWidth, 8);
        ctx.fillRect(restX - clockWidth / 2, restY + clockHeight / 2 - 8, clockWidth, 8);

        // Light bouncing vertically
        const bounce1 = (Math.sin(time * 2) + 1) / 2;
        const lightY1 = restY - clockHeight / 2 + bounce1 * clockHeight;
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        ctx.arc(restX, lightY1, 3, 0, Math.PI * 2);
        ctx.fill();

        // Light path
        ctx.strokeStyle = "#ffff00";
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(restX, restY - clockHeight / 2);
        ctx.lineTo(restX, restY + clockHeight / 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Moving frame (relativistic)
        const movingX = 650;
        const movingY = 150;
        const beta = velocity;
        const gamma = timeDilation(beta);

        ctx.fillStyle = "#aaa";
        ctx.font = "12px sans-serif";
        ctx.fillText(
          `Moving Frame (v = ${(velocity * 100).toFixed(0)}% c)`,
          movingX - 20,
          movingY - 20,
        );

        // Draw moving mirrors with velocity indicator
        ctx.fillStyle = "#444";
        ctx.fillRect(movingX - clockWidth / 2, movingY - clockHeight / 2, clockWidth, 8);
        ctx.fillRect(
          movingX - clockWidth / 2,
          movingY + clockHeight / 2 - 8,
          clockWidth,
          8,
        );

        // Velocity arrow
        ctx.strokeStyle = "#4da6ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(movingX + 30, movingY - clockHeight / 2 - 20);
        ctx.lineTo(movingX + 60, movingY - clockHeight / 2 - 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(movingX + 55, movingY - clockHeight / 2 - 25);
        ctx.lineTo(movingX + 60, movingY - clockHeight / 2 - 20);
        ctx.lineTo(movingX + 55, movingY - clockHeight / 2 - 15);
        ctx.stroke();

        // Light bouncing diagonally (in moving frame perspective)
        const bounce2 = (Math.sin(time * 2 * (1 / gamma)) + 1) / 2;
        const lightY2 = movingY - clockHeight / 2 + bounce2 * clockHeight;
        const horizontalOffset = bounce2 * velocity * clockHeight;

        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        ctx.arc(movingX + horizontalOffset, lightY2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Light path (diagonal)
        ctx.strokeStyle = "#ffff00";
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(movingX, movingY - clockHeight / 2);
        ctx.lineTo(movingX + velocity * clockHeight, movingY + clockHeight / 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Info box
        ctx.fillStyle = "#111";
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.fillRect(20, h - 180, 380, 160);
        ctx.strokeRect(20, h - 180, 380, 160);

        ctx.fillStyle = "#aaa";
        ctx.font = "11px monospace";
        ctx.fillText("Time Dilation Formula:", 30, h - 160);
        ctx.fillStyle = "#888";
        ctx.fillText("t' = γt   where  γ = 1/√(1 - v²/c²)", 30, h - 145);
        ctx.fillText(
          `Current γ = ${gamma.toFixed(2)}  (time slows by factor of ${gamma.toFixed(2)})`,
          30,
          h - 130,
        );

        ctx.fillStyle = "#aaa";
        ctx.font = "11px sans-serif";
        ctx.fillText("Explanation:", 30, h - 110);
        ctx.fillStyle = "#666";
        ctx.font = "10px sans-serif";
        ctx.fillText("• Light always travels at speed c", 30, h - 95);
        ctx.fillText(
          "• In moving frame, light travels diagonal path → longer distance",
          30,
          h - 82,
        );
        ctx.fillText(
          "• Longer path at same speed c → more time passes in that frame",
          30,
          h - 69,
        );
        ctx.fillText("• Therefore: time runs slower in moving frames", 30, h - 56);
        ctx.fillText("• At v → c, time nearly stops (γ → ∞)", 30, h - 43);
      } else {
        // Length contraction mode
        ctx.fillStyle = "#fff";
        ctx.font = "16px sans-serif";
        ctx.fillText("Length Contraction in Special Relativity", 20, 30);
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "#888";
        ctx.fillText(
          "Objects contract in the direction of motion. Measured length L' = L × √(1 - v²/c²)",
          20,
          50,
        );

        const beta = velocity;
        const contraction = lengthContraction(beta);

        // Rest length
        const restX = 100;
        const restY = 150;
        const restLength = 200;

        ctx.fillStyle = "#aaa";
        ctx.font = "12px sans-serif";
        ctx.fillText("At Rest (v = 0)", restX, restY - 30);

        ctx.fillStyle = "#4da6ff";
        ctx.fillRect(restX, restY, restLength, 20);
        ctx.fillStyle = "#fff";
        ctx.font = "11px sans-serif";
        ctx.fillText(`L = ${restLength}`, restX + restLength / 2 - 20, restY + 35);

        // Moving length
        const movingY = 250;
        const contractedLength = restLength * contraction;

        ctx.fillStyle = "#aaa";
        ctx.font = "12px sans-serif";
        ctx.fillText(
          `Moving at v = ${(velocity * 100).toFixed(0)}% c`,
          restX,
          movingY - 30,
        );

        ctx.fillStyle = "#ffaa00";
        ctx.fillRect(restX, movingY, contractedLength, 20);
        ctx.fillStyle = "#fff";
        ctx.font = "11px sans-serif";
        ctx.fillText(
          `L' = ${contractedLength.toFixed(0)}`,
          restX + contractedLength / 2 - 20,
          movingY + 35,
        );

        // Show original length as reference
        ctx.strokeStyle = "#4da6ff";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.strokeRect(restX, movingY, restLength, 20);
        ctx.globalAlpha = 1;

        // Info box
        ctx.fillStyle = "#111";
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.fillRect(20, h - 180, 380, 160);
        ctx.strokeRect(20, h - 180, 380, 160);

        ctx.fillStyle = "#aaa";
        ctx.font = "11px monospace";
        ctx.fillText("Length Contraction Formula:", 30, h - 160);
        ctx.fillStyle = "#888";
        ctx.fillText("L' = L√(1 - v²/c²) = L/γ", 30, h - 145);
        ctx.fillText(
          `Contraction factor = ${contraction.toFixed(3)}  (${((1 - contraction) * 100).toFixed(1)}% shorter)`,
          30,
          h - 130,
        );

        ctx.fillStyle = "#aaa";
        ctx.font = "11px sans-serif";
        ctx.fillText("Key Points:", 30, h - 110);
        ctx.fillStyle = "#666";
        ctx.font = "10px sans-serif";
        ctx.fillText("• Only contraction in direction of motion", 30, h - 95);
        ctx.fillText("• Perpendicular dimensions unchanged", 30, h - 82);
        ctx.fillText("• Observer moving with object sees no contraction", 30, h - 69);
        ctx.fillText("• At v → c, objects approach zero length", 30, h - 56);
        ctx.fillText("• Explains why fast particles penetrate matter", 30, h - 43);
      }
    };

    const animationId = setInterval(() => {
      render();
    }, 16);

    return () => {
      clearInterval(animationId);
    };
  }, [velocity, mode]);

  return (
    <div className="space-y-4">
      <figure className="relative overflow-hidden rounded-lg border border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full bg-black"
          style={{ aspectRatio: "640 / 480" }}
        />
        <figcaption className="sr-only">
          Visualization of special relativity effects including time dilation and length
          contraction.
        </figcaption>
      </figure>

      <div className="space-y-3 rounded-lg border border-white/20 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`toggle ${mode === "light-clock" ? "active" : ""}`}
            onClick={() => setMode("light-clock")}
          >
            Time Dilation
          </button>
          <button
            type="button"
            className={`toggle ${mode === "length-contraction" ? "active" : ""}`}
            onClick={() => setMode("length-contraction")}
          >
            Length Contraction
          </button>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <span className="text-sm">Velocity:</span>
            <input
              type="range"
              min="0"
              max="0.99"
              step="0.01"
              value={velocity}
              onChange={(e) => setVelocity(Number(e.target.value))}
              className="w-40"
            />
            <span className="text-sm">{(velocity * 100).toFixed(0)}% c</span>
          </label>
        </div>

        <p className="source text-sm leading-relaxed">
          Special relativity reveals that time and space are not absolute. As objects move
          faster, time runs slower (time dilation), and they become shorter in the
          direction of motion (length contraction). These are not illusions—they are real
          relativistic effects. The light clock thought experiment elegantly shows how
          maintaining a constant speed of light for all observers requires time to run at
          different rates in different reference frames. At everyday speeds these effects
          are imperceptible, but near light speed they become dramatic.
        </p>
      </div>
    </div>
  );
}
