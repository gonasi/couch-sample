import { useEffect } from "react";
import { useUI } from "../context/UIContext";

/** Registers the height of a fixed bottom bar so toasts and the demo switcher float above it. */
export function useBottomOffset(key: string, px: number) {
  const { setBottomOffsetFor } = useUI();
  useEffect(() => {
    setBottomOffsetFor(key, px);
  }, [key, px, setBottomOffsetFor]);
  useEffect(() => () => setBottomOffsetFor(key, 0), [key, setBottomOffsetFor]);
}
