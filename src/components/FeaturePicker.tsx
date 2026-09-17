import type { SpinConfig } from "../data/spin.generated";
import { comboFor, comboKey, setForProduct } from "../lib/spin";

/** Human order; anything the source adds later just falls to the end. */
const AXIS_ORDER = ["ARMS", "CHAISE", "OTTOMAN", "CUSHION"];

/**
 * Arm / chaise / ottoman pickers, mirroring Cozey's option stack.
 *
 * Every option is checked against the generated manifest, so a button is only offered if
 * that exact configuration was actually mirrored. The handful that are invalid at source
 * (SF-1 rejects ARMS:LOW with CUSHION:ON) render disabled with a reason rather than
 * silently substituting a different sofa.
 */
export function ConfigOptions({
  productSlug,
  cfg,
  fabricCode,
  onChange,
  only,
  hideLabel,
}: {
  productSlug: string;
  cfg: SpinConfig;
  fabricCode: string;
  onChange: (axis: string, code: string) => void;
  /** Render just these axes, for layouts that split them across sections. */
  only?: string[];
  hideLabel?: boolean;
}) {
  const set = setForProduct(productSlug);
  if (!set) return null;

  const axes = Object.keys(set.optionCodes)
    .filter((a) => a !== "FABRIC")
    .filter((a) => !only || only.includes(a))
    .sort((a, b) => {
      const ia = AXIS_ORDER.indexOf(a);
      const ib = AXIS_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });

  return (
    <div className="stack" style={{ ["--gap" as string]: "12px" }}>
      {axes.map((axis) => (
        <div key={axis}>
          {!hideLabel && <span className="label">{titleOf(axis)}</span>}
          <div
            className="row wrap"
            style={{ gap: 8, marginTop: 7 }}
            role="radiogroup"
            aria-label={titleOf(axis)}
          >
            {set.optionCodes[axis].map((code) => {
              const candidate = { ...cfg, [axis]: code, FABRIC: fabricCode };
              const entry = comboFor(set, comboKey(candidate));
              const selected = cfg[axis] === code;
              const label = set.labels[axis]?.[code] ?? code;
              return (
                <button
                  key={code}
                  role="radio"
                  aria-checked={selected}
                  disabled={!entry}
                  title={
                    entry
                      ? entry.frames.length > 1
                        ? `${label} — 360° view`
                        : `${label} — single view`
                      : `${label} isn't available with this combination`
                  }
                  className={`chip `}
                  onClick={() => onChange(axis, code)}
                >
                  {label}
                  {entry && entry.frames.length === 1 && (
                    <span className="chip-note">single view</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

const titleOf = (axis: string) =>
  axis.charAt(0) + axis.slice(1).toLowerCase();
