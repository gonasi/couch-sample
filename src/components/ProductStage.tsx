import type { CSSProperties } from "react";
import { Img } from "./ui";
import { SpinViewer } from "./SpinViewer";
import type { SpinSource } from "../lib/spin";

/**
 * The hero slot for a product. Props are a superset of <Img>'s, so swapping a variant's
 * hero over is a one-line change and thumbnails / lightbox / zoom lens stay untouched.
 */
export function ProductStage({
  spin,
  src,
  alt,
  ratio,
  w = 1400,
  eager,
  radius,
  className,
  style,
  onExpand,
}: {
  spin: SpinSource;
  /** the photo this stage would otherwise show */
  src: string;
  alt: string;
  ratio?: string;
  w?: number;
  eager?: boolean;
  radius?: string;
  className?: string;
  style?: CSSProperties;
  onExpand?: () => void;
}) {
  if (spin.kind === "spin")
    return (
      <SpinViewer
        set={spin.set}
        combo={spin.combo}
        size={spin.size}
        frames={spin.frames}
        alt={alt}
        ratio={ratio}
        radius={radius}
        className={className}
        style={style}
        eager={eager}
        onExpand={onExpand}
      />
    );

  // A mirrored render that only has frame 1: show it, but offer no spin affordance.
  if (spin.kind === "still")
    return (
      <Img
        src={spin.src}
        alt={alt}
        ratio={ratio}
        radius={radius}
        className={className}
        style={style}
        eager={eager}
        fit="contain"
      />
    );

  return (
    <Img
      src={src}
      alt={alt}
      w={w}
      ratio={ratio}
      radius={radius}
      className={className}
      style={style}
      eager={eager}
    />
  );
}

/** For gallery slots that are ordinary photography rather than the render. */
export const photoSource = (src: string): SpinSource => ({
  kind: "photo",
  src,
  reason: "no-combo",
});

/** True when the hero slot is a real 360 set, for "360" badges on thumb 0. */
export const isSpinnable = (s: SpinSource) => s.kind === "spin";
