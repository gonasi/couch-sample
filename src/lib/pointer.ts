/** setPointerCapture throws if the pointer is already gone (fast taps, cancelled touches). */
export function capturePointer(el: Element | null | undefined, pointerId: number) {
  try {
    el?.setPointerCapture(pointerId);
  } catch {
    /* pointer no longer active */
  }
}
