import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Img, Modal } from "./ui";

/** Mock video player: poster image, play/pause, animated progress. */
export default function VideoModal({
  open,
  onClose,
  poster,
  title,
}: {
  open: boolean;
  onClose: () => void;
  poster: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (open) setPlaying(true);
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={() => {
        setPlaying(false);
        onClose();
      }}
      width={960}
      label={title}
    >
      <div style={{ position: "relative", background: "#111", color: "#fff" }}>
        <Img
          src={poster}
          alt={title}
          w={1800}
          ratio="16/9"
          style={{
            background: "#111",
            filter: playing ? "none" : "brightness(.7)",
            transition: "filter .3s",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg,transparent 60%,rgba(0,0,0,.65))",
          }}
        />
        {!playing && (
          <button
            onClick={() => setPlaying(true)}
            aria-label="Play"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 76,
              height: 76,
              borderRadius: 99,
              border: 0,
              background: "rgba(255,255,255,.92)",
              color: "#111",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Play size={28} fill="#111" />
          </button>
        )}
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause" : "Play"}
            style={{
              border: 0,
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
              padding: 0,
              display: "flex",
            }}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <div
            style={{
              flex: 1,
              height: 3,
              background: "rgba(255,255,255,.3)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "#fff",
                transformOrigin: "left",
                animation: "ugcProgress 18s linear infinite",
                animationPlayState: playing ? "running" : "paused",
              }}
            />
          </div>
          <span style={{ fontSize: 12.5, letterSpacing: ".08em" }}>
            {title}
          </span>
        </div>
      </div>
    </Modal>
  );
}
