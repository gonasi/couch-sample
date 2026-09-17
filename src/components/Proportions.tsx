import { useState } from "react";
import type { Product } from "../data/products";

/** Heights offered by the toggle, in inches. */
const PEOPLE = [
  { label: `5'5"`, cm: 165, inches: 65 },
  { label: `5'7"`, cm: 170, inches: 67 },
  { label: `6'1"`, cm: 185, inches: 73 },
];

/** Pull W / D / H out of a dims string like `99" W × 88" D × 33" H`. */
function parseDims(overall?: string) {
  const nums = overall?.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  return { w: nums[0] ?? 99, d: nums[1] ?? 88, h: nums[2] ?? 33 };
}

/**
 * "How big is this, really" - the sofa drawn in front elevation next to a person, both
 * to the same scale. A silhouette beside a to-scale sofa answers the question more
 * honestly than overlaying a figure onto a photograph, where the camera's perspective
 * would make any single scale wrong.
 */
export function Proportions({ product }: { product: Product }) {
  const [pick, setPick] = useState(1);
  const { w, h } = parseDims(product.dims?.overall);
  const person = PEOPLE[pick];

  // Lay out in inches, then let the viewBox do the scaling.
  const padX = 8;
  const gap = 10;
  const tallest = Math.max(h, PEOPLE[PEOPLE.length - 1].inches);
  const vbW = w + gap + 26 + padX * 2;
  const vbH = tallest + 16;
  const floor = vbH - 8;
  const px = padX;
  const personX = px + w + gap + 13;

  const seatH = h * 0.55;
  const armW = w * 0.09;

  return (
    <div className="card card-pad" style={{ display: "grid", gap: 12 }}>
      <div className="row between wrap" style={{ gap: 10 }}>
        <span className="label">Seating &amp; proportions</span>
        <div className="row" style={{ gap: 6 }} role="radiogroup" aria-label="Reference height">
          {PEOPLE.map((p, i) => (
            <button
              key={p.label}
              role="radio"
              aria-checked={pick === i}
              className={`chip ${pick === i ? "active" : ""}`}
              style={{ padding: "5px 10px", fontSize: 12 }}
              onClick={() => setPick(i)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        role="img"
        aria-label={`${product.shortName} is ${h} inches tall, next to a person ${person.label} tall`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <line x1={0} y1={floor} x2={vbW} y2={floor} stroke="var(--line)" strokeWidth={0.6} />

        {/* sofa, front elevation */}
        <g fill="var(--soft)" stroke="var(--ink)" strokeWidth={0.7} strokeLinejoin="round">
          <rect x={px} y={floor - h} width={w} height={h - seatH} rx={2.5} />
          <rect x={px} y={floor - seatH} width={armW} height={seatH} rx={2} />
          <rect x={px + w - armW} y={floor - seatH} width={armW} height={seatH} rx={2} />
          <rect
            x={px + armW}
            y={floor - seatH}
            width={w - armW * 2}
            height={seatH * 0.62}
            rx={2}
          />
        </g>
        <line
          x1={px}
          y1={floor - seatH}
          x2={px + w}
          y2={floor - seatH}
          stroke="var(--ink)"
          strokeWidth={0.4}
          strokeDasharray="2 2"
          opacity={0.45}
        />

        {/* person, same scale - a plain silhouette, not a likeness */}
        <g fill="var(--accent)" opacity={0.9}>
          {(() => {
            const ph = person.inches;
            const head = ph * 0.13;
            const top = floor - ph;
            const shoulder = top + head * 1.35;
            const bodyW = ph * 0.17;
            return (
              <>
                <circle cx={personX} cy={top + head * 0.6} r={head * 0.52} />
                <rect
                  x={personX - bodyW / 2}
                  y={shoulder}
                  width={bodyW}
                  height={ph * 0.34}
                  rx={bodyW * 0.42}
                />
                <rect
                  x={personX - bodyW * 0.46}
                  y={shoulder + ph * 0.33}
                  width={bodyW * 0.38}
                  height={ph * 0.47}
                  rx={bodyW * 0.19}
                />
                <rect
                  x={personX + bodyW * 0.08}
                  y={shoulder + ph * 0.33}
                  width={bodyW * 0.38}
                  height={ph * 0.47}
                  rx={bodyW * 0.19}
                />
              </>
            );
          })()}
        </g>

        <text
          x={personX}
          y={floor - person.inches - 3}
          textAnchor="middle"
          fontSize={6}
          fill="var(--muted)"
          fontFamily="var(--mono)"
        >
          {person.cm} cm
        </text>
        <text x={px} y={floor - h - 3} fontSize={6} fill="var(--muted)" fontFamily="var(--mono)">
          {h}&quot; H
        </text>
      </svg>

      <p className="muted" style={{ fontSize: 13, margin: 0 }}>
        Seat height {Math.round(h * 0.55)}&quot; · overall {w}&quot; wide. Drawn to scale
        against someone {person.label} ({person.cm} cm).
      </p>
    </div>
  );
}
