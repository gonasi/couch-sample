import { useMemo } from "react";
import qrcode from "qrcode-generator";
import { Smartphone } from "lucide-react";

/**
 * Hands the *configured* sofa to a phone. The share URL already encodes fabric and every
 * geometry axis, so scanning this opens the same configuration rather than the default one.
 *
 * Cozey uses this slot for an AR try-on. Cylindo exposes no GLB/USDZ for these products
 * (every 3d endpoint 404s), so there is no model to place in a room - this does the honest
 * version of the same job instead of miming a feature we cannot perform.
 */
export function PhoneHandoff({ url, label }: { url: string; label: string }) {
  const modules = useMemo(() => {
    try {
      const qr = qrcode(0, "M");
      qr.addData(url);
      qr.make();
      const n = qr.getModuleCount();
      return { n, at: (r: number, c: number) => qr.isDark(r, c) };
    } catch {
      return null;
    }
  }, [url]);

  if (!modules) return null;
  const { n, at } = modules;
  const quiet = 2;
  const size = n + quiet * 2;

  return (
    <div className="card card-pad row" style={{ gap: 16, alignItems: "flex-start" }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`QR code linking to ${label}`}
        style={{ width: 96, height: 96, flex: "0 0 auto", borderRadius: 6 }}
        shapeRendering="crispEdges"
      >
        <rect width={size} height={size} fill="#fff" />
        {Array.from({ length: n }, (_, r) =>
          Array.from({ length: n }, (_, c) =>
            at(r, c) ? (
              <rect key={`${r}-${c}`} x={c + quiet} y={r + quiet} width={1} height={1} fill="#111" />
            ) : null,
          ),
        )}
      </svg>
      <div style={{ display: "grid", gap: 6 }}>
        <span className="row label" style={{ gap: 6 }}>
          <Smartphone size={14} /> See it on your phone
        </span>
        <p className="muted" style={{ fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
          Scan to open this exact configuration — fabric, arms, chaise and ottoman — on your
          phone, where you can spin it with your thumb.
        </p>
      </div>
    </div>
  );
}
