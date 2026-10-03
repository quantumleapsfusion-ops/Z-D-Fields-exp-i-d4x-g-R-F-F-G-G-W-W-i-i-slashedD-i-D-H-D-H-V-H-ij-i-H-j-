"use client";

import { useEffect, useRef, useState } from "react";

import {
  ageOnPlanet,
  planets,
  sunlightTravelSeconds,
  weightOn,
  type Planet,
} from "@/lib/explore/planets";

function PlanetCanvas({ planet }: { planet: Planet }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dpr = 1;
    let width = 0;
    let height = 0;
    let frame = 0;
    let rotation = 0;
    let last = performance.now();
    let elapsed = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduceMotion) {
        const direction = planet.name === "Venus" || planet.name === "Uranus" ? -1 : 1;
        const speed = Math.min(1.25, Math.max(0.04, 24 / planet.dayHours));
        rotation += dt * speed * direction;
        elapsed += dt;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width * 0.29, height * 0.37);
      const colors = planet.colours;
      if (planet.rings) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.3);
        ctx.scale(1, 0.28);
        ctx.strokeStyle = "rgba(225,205,165,0.62)";
        ctx.lineWidth = Math.max(3, radius * 0.12);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.65, radius * 1.65, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(245,235,215,0.54)";
        ctx.lineWidth = Math.max(1, radius * 0.025);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.85, radius * 1.85, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      const lightX = cx - radius * 0.35;
      const lightY = cy - radius * 0.42;
      const body = ctx.createRadialGradient(
        lightX,
        lightY,
        radius * 0.08,
        cx,
        cy,
        radius * 1.08,
      );
      body.addColorStop(0, colors.light);
      body.addColorStop(0.53, colors.mid);
      body.addColorStop(1, colors.dark);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = "rgba(255,255,255,0.17)";
      ctx.lineWidth = Math.max(1, radius * 0.018);
      for (let longitude = -1; longitude <= 1; longitude += 1) {
        const longitudeX = cx + Math.sin(rotation + longitude * 1.15) * radius * 0.75;
        const longitudeWidth = Math.max(
          radius * 0.08,
          Math.abs(Math.cos(rotation + longitude * 1.15)) * radius * 0.42,
        );
        ctx.beginPath();
        ctx.ellipse(longitudeX, cy, longitudeWidth, radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      if (planet.colours.bands) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();
        planet.colours.bands.forEach((color, index) => {
          const y = cy + Math.sin(rotation + index * 1.3) * radius * 0.36;
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = color;
          ctx.fillRect(cx - radius, y - radius * 0.075, radius * 2, radius * 0.15);
        });
        ctx.globalAlpha = 1;
        const shade = ctx.createRadialGradient(
          lightX,
          lightY,
          radius * 0.25,
          cx,
          cy,
          radius * 1.1,
        );
        shade.addColorStop(0, "rgba(0,0,0,0)");
        shade.addColorStop(1, "rgba(0,0,0,0.6)");
        ctx.fillStyle = shade;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.restore();
      }
      if (planet.rings) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - radius * 2, cy, radius * 4, radius * 2);
        ctx.clip();
        ctx.translate(cx, cy);
        ctx.rotate(-0.3);
        ctx.scale(1, 0.28);
        ctx.strokeStyle = "rgba(240,225,190,0.78)";
        ctx.lineWidth = Math.max(2, radius * 0.11);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.65, radius * 1.65, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      const moonCount =
        planet.name === "Earth"
          ? 1
          : planet.name === "Mars"
            ? 2
            : planet.name === "Jupiter" || planet.name === "Saturn"
              ? 3
              : 0;
      for (let i = 0; i < moonCount; i += 1) {
        const angle = elapsed * (0.5 + i * 0.25) + (i * Math.PI * 2) / moonCount;
        ctx.fillStyle = "rgba(235,238,245,0.9)";
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(angle) * radius * (1.55 + i * 0.2),
          cy + Math.sin(angle) * radius * 0.55,
          Math.max(2, radius * 0.045),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };
    resize();
    frame = requestAnimationFrame(draw);
    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) frame = requestAnimationFrame(draw);
    });
    observer.observe(canvas);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [planet]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={`${planet.name}, a shaded rotating ${planet.rings ? "ringed " : ""}planet illustration`}
      className="h-72 w-full sm:h-80"
    />
  );
}

function PlanetCard({
  planet,
  selected,
  onClick,
}: {
  planet: Planet;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="toggle flex items-center gap-2"
    >
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: planet.colours.mid }}
      />
      {planet.name}
    </button>
  );
}

export function PlanetExplorer() {
  const [index, setIndex] = useState(2);
  const [weightKg, setWeightKg] = useState("70");
  const [ageEarth, setAgeEarth] = useState("30");
  const planet = planets[index];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === "ArrowLeft")
        setIndex((current) => (current + planets.length - 1) % planets.length);
      if (event.key === "ArrowRight")
        setIndex((current) => (current + 1) % planets.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const earth = planets[2];
  const wt = Number(weightKg);
  const age = Number(ageEarth);
  const lightTime = sunlightTravelSeconds(planet);
  const sizeScale = Math.max(...planets.map((item) => item.diameterKm));

  return (
    <div className="mt-8">
      <div className="flex flex-wrap justify-center gap-2" aria-label="Choose a planet">
        {planets.map((item, itemIndex) => (
          <PlanetCard
            key={item.name}
            planet={item}
            selected={index === itemIndex}
            onClick={() => setIndex(itemIndex)}
          />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(20rem,1.1fr)_minmax(20rem,1fr)]">
        <div className="relative rounded-sm border border-white/15 bg-black/30">
          <PlanetCanvas key={planet.name} planet={planet} />
          <div className="absolute top-4 left-5">
            <p className="text-2xl">{planet.name}</p>
            <p className="label mt-1">
              {planet.distanceAU} AU from the Sun · sunlight{" "}
              {lightTime < 60
                ? `${lightTime.toFixed(1)} s`
                : `${(lightTime / 60).toFixed(1)} min`}
            </p>
          </div>
          <div className="absolute right-4 bottom-4 left-4 flex justify-between">
            <button
              type="button"
              className="toggle"
              onClick={() => setIndex((index + 7) % 8)}
              aria-label="Previous planet"
            >
              ← Previous
            </button>
            <button
              type="button"
              className="toggle"
              onClick={() => setIndex((index + 1) % 8)}
              aria-label="Next planet"
            >
              Next →
            </button>
          </div>
        </div>
        <div className="space-y-5">
          <div className="overflow-x-auto border border-white/15">
            <table className="w-full min-w-[26rem] font-sans text-sm">
              <caption className="label p-3 text-left">
                Planet compared with Earth
              </caption>
              <thead className="text-white/55">
                <tr>
                  <th className="p-2 text-left font-normal">Measure</th>
                  <th className="p-2 text-right font-normal">{planet.name}</th>
                  <th className="p-2 text-right font-normal">Earth</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Diameter",
                    `${planet.diameterKm.toLocaleString()} km`,
                    `${earth.diameterKm.toLocaleString()} km`,
                  ],
                  ["Mass", `${planet.massEarths} Earths`, "1 Earth"],
                  ["Surface gravity", `${planet.gravity} m/s²`, "9.81 m/s²"],
                  ["Escape speed", `${planet.escapeKmS} km/s`, "11.2 km/s"],
                  ["Solar day", `${planet.dayHours.toLocaleString()} h`, "24 h"],
                  [
                    "Orbital period",
                    `${planet.orbitDays.toLocaleString()} d`,
                    "365.256 d",
                  ],
                  ["Mean temperature", `${planet.meanTempC} °C`, "15 °C"],
                  ["Known moons", `${planet.moons}`, "1"],
                ].map(([label, current, earthValue]) => (
                  <tr key={label} className="border-t border-white/10">
                    <th className="p-2 text-left font-normal text-white/70">{label}</th>
                    <td className="p-2 text-right">{current}</td>
                    <td className="p-2 text-right text-white/55">{earthValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Your weight here · kg</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={weightKg}
                onChange={(event) => setWeightKg(event.target.value)}
                className="mt-2 w-full border border-white/30 bg-black/50 px-3 py-2 font-sans text-white"
              />
              <span className="source mt-2 block" aria-live="polite">
                {Number.isFinite(wt)
                  ? `${weightOn(planet, wt).toFixed(1)} kg equivalent on ${planet.name}`
                  : "Enter a mass in kilograms"}
              </span>
            </label>
            <label className="block">
              <span className="label">Your age on Earth · years</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={ageEarth}
                onChange={(event) => setAgeEarth(event.target.value)}
                className="mt-2 w-full border border-white/30 bg-black/50 px-3 py-2 font-sans text-white"
              />
              <span className="source mt-2 block" aria-live="polite">
                {Number.isFinite(age) && planet.orbitDays > 0
                  ? `${ageOnPlanet(planet, age).toFixed(2)} ${planet.name} years`
                  : "Enter an age"}
              </span>
            </label>
          </div>
        </div>
      </div>
      <p className="source mt-5">
        {planet.atmosphere} {planet.facts.join(" ")} Known moons; the count changes as
        more are found.
      </p>
      <div className="mt-4">
        <p className="label">Notable missions</p>
        <p className="source mt-1">{planet.missions.join(" · ")}</p>
      </div>
      <section
        aria-label="Planet diameters to scale"
        className="mt-9 border-t border-white/15 pt-5"
      >
        <p className="label">Planet sizes to scale by diameter</p>
        <div className="mt-4 flex items-end justify-between gap-2 overflow-x-auto pb-3">
          {planets.map((item, itemIndex) => {
            const size = Math.max(3, (item.diameterKm / sizeScale) * 108);
            return (
              <button
                key={item.name}
                type="button"
                aria-label={`${item.name}, diameter ${item.diameterKm.toLocaleString()} kilometres`}
                aria-pressed={index === itemIndex}
                onClick={() => setIndex(itemIndex)}
                className="flex min-w-16 flex-col items-center gap-2 text-center focus-visible:outline-2 focus-visible:outline-white"
              >
                <span
                  aria-hidden="true"
                  className="rounded-full"
                  style={{
                    width: size,
                    height: size,
                    background: `radial-gradient(circle at 32% 28%, ${item.colours.light}, ${item.colours.mid} 55%, ${item.colours.dark})`,
                  }}
                />
                <span className="source">{item.name}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
