import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "../ui/button";
import ToolPanel, { ToolSection, FieldLabel } from "../ToolPanel";
import { cn } from "@/lib/utils";

const RING_PRESETS = [
  {
    id: "pride",
    label: "Pride",
    colors: ["#e40303", "#ff8c00", "#ffed00", "#008026", "#24408e", "#732982"],
  },
  {
    id: "trans",
    label: "Trans",
    colors: ["#5bcefa", "#f5a9b8", "#ffffff", "#f5a9b8", "#5bcefa"],
  },
  {
    id: "bi",
    label: "Bi",
    colors: ["#d60270", "#d60270", "#9b4f96", "#0038a8", "#0038a8"],
  },
  {
    id: "lesbian",
    label: "Lesbian",
    colors: ["#d52d00", "#ef7627", "#ff9a56", "#ffffff", "#d162a4", "#b55690", "#a30262"],
  },
  {
    id: "nonbinary",
    label: "Non-binary",
    colors: ["#fcf434", "#ffffff", "#9c59d1", "#2c2c2c"],
  },
  {
    id: "pan",
    label: "Pan",
    colors: ["#ff218c", "#ffd800", "#21b1ff"],
  },
  {
    id: "ace",
    label: "Ace",
    colors: ["#000000", "#a3a3a3", "#ffffff", "#800080"],
  },
  {
    id: "gradient",
    label: "Aurora",
    colors: ["#7c3aed", "#2563eb", "#06b6d4", "#22c55e"],
  },
  {
    id: "gold",
    label: "Gold",
    colors: ["#f59e0b", "#fde68a", "#b45309", "#fbbf24"],
  },
  {
    id: "nitro",
    label: "Blurple",
    colors: ["#5865f2", "#eb459e", "#5865f2"],
  },
];

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImageUrl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawRing(ctx, cx, cy, outerR, innerR, colors) {
  const stops = colors.length;
  for (let i = 0; i < stops; i++) {
    const start = (i / stops) * Math.PI * 2 - Math.PI / 2;
    const end = ((i + 1) / stops) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, (outerR + innerR) / 2, start, end);
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = outerR - innerR;
    ctx.lineCap = "butt";
    ctx.stroke();
  }
}

export default function PfpRingTool() {
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const [presetId, setPresetId] = useState("pride");
  const [thickness, setThickness] = useState(18);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  const preset = useMemo(
    () => RING_PRESETS.find((p) => p.id === presetId) || RING_PRESETS[0],
    [presetId]
  );

  const paint = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const outer = size / 2;
    const inner = outer - thickness;

    // Ring
    drawRing(ctx, cx, cy, outer, inner, preset.colors);

    // Avatar circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, inner - 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = "#1e1f22";
    ctx.fillRect(0, 0, size, size);

    if (image) {
      // cover
      const scale = Math.max(size / image.width, size / image.height);
      const w = image.width * scale;
      const h = image.height * scale;
      ctx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h);
    } else {
      ctx.fillStyle = "#5865f2";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "700 120px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", cx, cy + 8);
    }
    ctx.restore();
  };

  useEffect(() => {
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, thickness, image]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const img = await loadImageFromFile(file);
      setImage(img);
    } catch {
      setError("Could not read that image.");
    }
  };

  const useSample = async () => {
    setError("");
    try {
      const svg =
        "data:image/svg+xml," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5865f2"/><stop offset="1" stop-color="#eb459e"/></linearGradient></defs><rect width="512" height="512" fill="url(#g)"/><text x="256" y="290" text-anchor="middle" font-size="180" fill="#fff" font-family="sans-serif" font-weight="700">N</text></svg>`
        );
      setImage(await loadImageUrl(svg));
    } catch {
      setError("Sample failed to load.");
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `pfp-ring-${preset.id}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <ToolPanel fill>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
        <ToolSection title="Ring" description="Add pride rings, gradients, and frames to a profile picture">
          <FieldLabel>Preset</FieldLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {RING_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPresetId(p.id)}
                className={cn(
                  "nx-selectable py-2 px-2 text-left",
                  presetId === p.id && "nx-selectable-active"
                )}
              >
                <span
                  className="block h-2 rounded-full mb-2"
                  style={{
                    background: `linear-gradient(90deg, ${p.colors.join(", ")})`,
                  }}
                />
                <span className="text-xs font-semibold">{p.label}</span>
              </button>
            ))}
          </div>

          <FieldLabel hint={`${thickness}px`}>Ring thickness</FieldLabel>
          <input
            type="range"
            min={8}
            max={48}
            value={thickness}
            onChange={(e) => setThickness(Number(e.target.value))}
            className="w-full mb-4"
          />

          <FieldLabel>Avatar image</FieldLabel>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" />
              Upload
            </Button>
            <Button type="button" variant="secondary" onClick={useSample}>
              Sample
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          </div>
          {error && <p className="mt-3 text-sm text-[var(--nx-red)]">{error}</p>}
        </ToolSection>

        <ToolSection
          title="Preview"
          description="512×512 PNG export"
          action={
            <Button type="button" size="sm" onClick={download}>
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
          }
        >
          <div className="flex justify-center p-6 rounded-xl bg-[var(--nx-bg-input)] border border-[var(--nx-border)]">
            <canvas ref={canvasRef} className="w-56 h-56 sm:w-64 sm:h-64 rounded-full" />
          </div>
        </ToolSection>
      </div>
    </ToolPanel>
  );
}
