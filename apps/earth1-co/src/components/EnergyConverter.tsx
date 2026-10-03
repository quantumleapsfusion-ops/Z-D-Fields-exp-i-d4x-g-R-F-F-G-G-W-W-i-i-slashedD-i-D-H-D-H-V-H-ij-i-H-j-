"use client";

import { useState } from "react";

/**
 * E=mc² Interactive Energy Converter
 * Convert mass to energy and show real-world equivalents
 */
export function EnergyConverter() {
  const [mass, setMass] = useState(1); // grams
  const [massUnit, setMassUnit] = useState<"g" | "kg" | "mg">("g");

  // Convert to kilograms
  const massInKg =
    massUnit === "kg" ? mass : massUnit === "g" ? mass / 1000 : mass / 1_000_000;

  // c = speed of light = 299,792,458 m/s
  const c = 299_792_458;
  const cSquared = c * c;

  // E = mc²
  const energyJoules = massInKg * cSquared;

  // Energy conversions
  const energyKwh = energyJoules / 3.6e6;
  const energyMegaTonsTNT = energyJoules / 4.184e15;
  const energyGigaTonsTNT = energyMegaTonsTNT / 1000;

  // Real-world comparisons
  const householdsOneYear = energyKwh / (10_000 * 365); // typical household uses ~10,000 kWh/year
  const hiroshimaWarheads = energyMegaTonsTNT / 15; // Hiroshima was ~15 megatons
  const timeToSunUs = energyJoules / 386_000_000_000_000; // Sun produces ~386e12 watts

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/20 bg-black/50 p-4">
        <h3 className="mb-4 text-lg font-bold text-white">E=mc²: Energy from Mass</h3>

        <div className="space-y-4">
          {/* Mass Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Enter mass to convert to energy:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.0001"
                max="1000000"
                step="0.1"
                value={mass}
                onChange={(e) => setMass(Number(e.target.value))}
                className="flex-1 rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
              />
              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value as "g" | "kg" | "mg")}
                className="rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white"
              >
                <option value="mg">milligrams</option>
                <option value="g">grams</option>
                <option value="kg">kilograms</option>
              </select>
            </div>
          </div>

          {/* Energy Display */}
          <div className="space-y-3">
            <div className="rounded bg-gray-900 p-3">
              <div className="mb-1 text-sm text-gray-400">Energy (E = mc²)</div>
              <div className="font-mono text-lg text-yellow-400">
                {energyJoules.toExponential(2)} J
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {energyJoules.toLocaleString()} Joules
              </div>
            </div>

            {/* Energy in various units */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded bg-gray-900 p-2">
                <div className="mb-1 text-xs text-gray-400">Kilowatt-hours</div>
                <div className="font-mono text-white">
                  {energyKwh.toExponential(2)} kWh
                </div>
              </div>
              <div className="rounded bg-gray-900 p-2">
                <div className="mb-1 text-xs text-gray-400">TNT equivalent</div>
                <div className="font-mono text-white">
                  {energyMegaTonsTNT > 1
                    ? `${energyMegaTonsTNT.toExponential(2)} Mt`
                    : `${(energyMegaTonsTNT * 1000).toExponential(2)} kt`}
                </div>
              </div>
            </div>
          </div>

          {/* Real-world comparisons */}
          <div className="space-y-2 rounded bg-gray-900 p-3 text-sm">
            <div className="mb-2 font-medium text-gray-400">Real-world equivalents:</div>

            {householdsOneYear > 0.001 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Household power for a year:</span>
                <span className="font-mono text-white">
                  {householdsOneYear.toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}{" "}
                  homes
                </span>
              </div>
            )}

            {hiroshimaWarheads > 0.00001 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Hiroshima bombs (15 Mt):</span>
                <span className="font-mono text-white">
                  {hiroshimaWarheads.toExponential(2)} warheads
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Seconds of Sun&apos;s output:</span>
              <span className="font-mono text-white">
                {timeToSunUs.toLocaleString(undefined, { maximumFractionDigits: 1 })} s
              </span>
            </div>

            {massInKg >= 1 && (
              <div className="flex items-center justify-between text-orange-400">
                <span>
                  Mass of a coin could power civilization for days. This is why nuclear
                  energy is so powerful.
                </span>
              </div>
            )}
          </div>

          {/* Formula explanation */}
          <div className="space-y-1 rounded border border-gray-700 bg-gray-900 p-3 text-xs text-gray-300">
            <div className="mb-2 font-mono text-gray-400">E = mc²</div>
            <div>• E = energy (Joules)</div>
            <div>• m = mass (kilograms)</div>
            <div>• c = speed of light = 299,792,458 m/s ≈ 3×10⁸ m/s</div>
            <div className="mt-2 text-gray-400">
              Since c is so large (~10¹⁶ when squared), even a tiny amount of mass
              converts to enormous energy. One kilogram of mass has the energy of 20,000
              megatons of TNT.
            </div>
          </div>
        </div>
      </div>

      <p className="source text-sm leading-relaxed text-gray-300">
        Einstein's most famous equation reveals that mass and energy are interchangeable.
        A small amount of mass contains vast amounts of energy because light speed is so
        enormous. This explains why nuclear fission and fusion release such devastating
        energy from a small amount of matter. The Sun converts about 600 million tons of
        hydrogen to helium every second, converting just 4 million tons of matter into
        pure energy via E=mc². This is why the Sun has shone for 4.6 billion years and
        will continue for another 5 billion more.
      </p>
    </div>
  );
}
