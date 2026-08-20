"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Canvas,
  Circle,
  Triangle,
  Line,
  IText,
  Group,
  type FabricObject,
  type TPointerEventInfo,
  type TPointerEvent,
} from "fabric";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import {
  MousePointer2,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Type,
  Minus,
  ArrowUpRight,
  Undo2,
  Redo2,
  Trash2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { attachMediaAction } from "@/lib/actions/media";

const COURT_WIDTH = 720;
const COURT_HEIGHT = 450;
const COURT_FILL = "#c77d33";
const LINE_COLOR = "#fdf6ec";

type Tool = "select" | "player" | "cone" | "ball" | "line" | "arrow" | "text";

export function DrawingCanvas({
  exerciseId,
  initialData,
  onClose,
}: {
  exerciseId: string;
  initialData?: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const historyRef = useRef<{ stack: string[]; index: number; suspend: boolean }>({
    stack: [],
    index: -1,
    suspend: false,
  });
  const playerCountRef = useRef(1);

  const [tool, setTool] = useState<Tool>("select");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Inicialització del canvas (un sol cop)
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: COURT_WIDTH,
      height: COURT_HEIGHT,
      backgroundColor: COURT_FILL,
    });
    canvasRef.current = canvas;

    const pushHistory = () => {
      const h = historyRef.current;
      if (h.suspend) return;
      const json = JSON.stringify(canvas.toJSON());
      h.stack = h.stack.slice(0, h.index + 1);
      h.stack.push(json);
      h.index = h.stack.length - 1;
      setCanUndo(h.index > 0);
      setCanRedo(false);
    };

    canvas.on("object:added", pushHistory);
    canvas.on("object:modified", pushHistory);
    canvas.on("object:removed", pushHistory);

    if (initialData) {
      historyRef.current.suspend = true;
      canvas
        .loadFromJSON(JSON.parse(initialData))
        .then(() => {
          canvas.renderAll();
          historyRef.current.suspend = false;
          pushHistory();
        })
        .catch(() => {
          drawCourtLines(canvas);
          historyRef.current.suspend = false;
          pushHistory();
        });
    } else {
      drawCourtLines(canvas);
      pushHistory();
    }

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Interacció: afegir formes en clicar, o dibuixar línies/fletxes arrossegant
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let draftLine: Line | null = null;
    let isDragging = false;

    const onDown = (opt: TPointerEventInfo<TPointerEvent>) => {
      const pointer = canvas.getScenePoint(opt.e);

      if (tool === "player" || tool === "cone" || tool === "ball" || tool === "text") {
        addShape(canvas, tool, pointer.x, pointer.y, playerCountRef);
        setTool("select");
        return;
      }

      if (tool === "line" || tool === "arrow") {
        isDragging = true;
        draftLine = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: "#1f2937",
          strokeWidth: 3,
          selectable: false,
          evented: false,
        });
        canvas.add(draftLine);
      }
    };

    const onMove = (opt: TPointerEventInfo<TPointerEvent>) => {
      if (!isDragging || !draftLine) return;
      const pointer = canvas.getScenePoint(opt.e);
      draftLine.set({ x2: pointer.x, y2: pointer.y });
      canvas.requestRenderAll();
    };

    const onUp = () => {
      if (!isDragging || !draftLine) return;
      isDragging = false;
      const line = draftLine;
      draftLine = null;

      if (tool === "arrow") {
        finalizeArrow(canvas, line);
      } else {
        line.set({ selectable: true, evented: true });
        canvas.setActiveObject(line);
        canvas.fire("object:modified", { target: line });
      }
      setTool("select");
    };

    canvas.on("mouse:down", onDown);
    canvas.on("mouse:move", onMove);
    canvas.on("mouse:up", onUp);

    return () => {
      canvas.off("mouse:down", onDown);
      canvas.off("mouse:move", onMove);
      canvas.off("mouse:up", onUp);
    };
  }, [tool]);

  // Tecla Suprimir esborra l'objecte seleccionat
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      const canvas = canvasRef.current;
      const active = canvas?.getActiveObject();
      if (!canvas || !active) return;

      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function applyHistory(index: number) {
    const canvas = canvasRef.current;
    const h = historyRef.current;
    if (!canvas || index < 0 || index >= h.stack.length) return;

    const snapshot = h.stack[index];
    if (!snapshot) return;

    h.suspend = true;
    h.index = index;
    canvas.loadFromJSON(JSON.parse(snapshot)).then(() => {
      canvas.renderAll();
      h.suspend = false;
      setCanUndo(h.index > 0);
      setCanRedo(h.index < h.stack.length - 1);
    });
  }

  function handleClear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = COURT_FILL;
    drawCourtLines(canvas);
  }

  async function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    try {
      canvas.discardActiveObject();
      canvas.requestRenderAll();

      const dataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
      const blob = dataUrlToBlob(dataUrl);
      const file = new File([blob], `dibuix-${Date.now()}.png`, { type: "image/png" });

      const uploaded = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/media/upload",
        clientPayload: JSON.stringify({ exerciseId }),
      });

      const result = await attachMediaAction({
        exerciseId,
        type: "drawing",
        blobUrl: uploaded.url,
        blobPathname: uploaded.pathname,
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        sizeBytes: blob.size,
        drawingData: JSON.stringify(canvas.toJSON()),
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Dibuix desat.");
        router.refresh();
        onClose();
      }
    } catch {
      toast.error("No s'ha pogut desar el dibuix. Torna-ho a provar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <ToolButton icon={MousePointer2} label="Seleccionar" active={tool === "select"} onClick={() => setTool("select")} />
        <ToolButton icon={CircleIcon} label="Jugador" active={tool === "player"} onClick={() => setTool("player")} />
        <ToolButton icon={TriangleIcon} label="Con" active={tool === "cone"} onClick={() => setTool("cone")} />
        <ToolButton icon={CircleIcon} label="Pilota" active={tool === "ball"} onClick={() => setTool("ball")} />
        <ToolButton icon={Minus} label="Línia" active={tool === "line"} onClick={() => setTool("line")} />
        <ToolButton icon={ArrowUpRight} label="Fletxa" active={tool === "arrow"} onClick={() => setTool("arrow")} />
        <ToolButton icon={Type} label="Text" active={tool === "text"} onClick={() => setTool("text")} />

        <div className="mx-1 hidden w-px bg-border sm:block" />

        <Button type="button" size="icon" variant="outline" onClick={() => applyHistory(historyRef.current.index - 1)} disabled={!canUndo} title="Desfer" aria-label="Desfer">
          <Undo2 className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button type="button" size="icon" variant="outline" onClick={() => applyHistory(historyRef.current.index + 1)} disabled={!canRedo} title="Refer" aria-label="Refer">
          <Redo2 className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button type="button" size="icon" variant="outline" onClick={handleClear} title="Esborra-ho tot" aria-label="Esborra tot el dibuix">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Clica per afegir jugador, con, pilota o text. Arrossega per dibuixar línies i fletxes.
        Selecciona un element i prem Suprimir per eliminar-lo.
      </p>

      <div className="max-w-full overflow-auto rounded-lg border border-border">
        <canvas ref={canvasElRef} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel·la
        </Button>
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? "Desant..." : "Desa el dibuix"}
        </Button>
      </div>
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "accent" : "outline"}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

function drawCourtLines(canvas: Canvas) {
  const w = canvas.getWidth();
  const h = canvas.getHeight();
  const opts = {
    stroke: LINE_COLOR,
    strokeWidth: 2,
    fill: "transparent",
    selectable: false,
    evented: false,
  };

  canvas.add(new Line([4, 4, w - 4, 4], opts));
  canvas.add(new Line([4, h - 4, w - 4, h - 4], opts));
  canvas.add(new Line([4, 4, 4, h - 4], opts));
  canvas.add(new Line([w - 4, 4, w - 4, h - 4], opts));
  canvas.add(new Line([w / 2, 4, w / 2, h - 4], opts));
  canvas.add(
    new Circle({ left: w / 2, top: h / 2, radius: 45, originX: "center", originY: "center", ...opts }),
  );

  const keyWidth = 130;
  const keyHeight = 160;
  canvas.add(new Line([4, h / 2 - keyHeight / 2, 4 + keyWidth, h / 2 - keyHeight / 2], opts));
  canvas.add(new Line([4, h / 2 + keyHeight / 2, 4 + keyWidth, h / 2 + keyHeight / 2], opts));
  canvas.add(new Line([4 + keyWidth, h / 2 - keyHeight / 2, 4 + keyWidth, h / 2 + keyHeight / 2], opts));
  canvas.add(new Line([w - 4, h / 2 - keyHeight / 2, w - 4 - keyWidth, h / 2 - keyHeight / 2], opts));
  canvas.add(new Line([w - 4, h / 2 + keyHeight / 2, w - 4 - keyWidth, h / 2 + keyHeight / 2], opts));
  canvas.add(
    new Line([w - 4 - keyWidth, h / 2 - keyHeight / 2, w - 4 - keyWidth, h / 2 + keyHeight / 2], opts),
  );

  canvas.renderAll();
}

function addShape(
  canvas: Canvas,
  tool: "player" | "cone" | "ball" | "text",
  x: number,
  y: number,
  playerCountRef: { current: number },
) {
  let obj: FabricObject;

  switch (tool) {
    case "player": {
      const number = playerCountRef.current++;
      const circle = new Circle({
        radius: 16,
        fill: "#1e293b",
        originX: "center",
        originY: "center",
      });
      const label = new IText(String(number), {
        fontSize: 14,
        fill: "#ffffff",
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
      });
      obj = new Group([circle, label], { left: x, top: y, originX: "center", originY: "center" });
      break;
    }
    case "cone":
      obj = new Triangle({
        width: 22,
        height: 26,
        fill: "#f97316",
        stroke: "#7c2d12",
        strokeWidth: 1,
        left: x,
        top: y,
        originX: "center",
        originY: "center",
      });
      break;
    case "ball":
      obj = new Circle({
        radius: 9,
        fill: "#ea580c",
        stroke: "#431407",
        strokeWidth: 1,
        left: x,
        top: y,
        originX: "center",
        originY: "center",
      });
      break;
    case "text":
      obj = new IText("Text", { left: x, top: y, fontSize: 18, fill: "#111827" });
      break;
  }

  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.requestRenderAll();
}

function finalizeArrow(canvas: Canvas, line: Line) {
  const x1 = line.x1 ?? 0;
  const y1 = line.y1 ?? 0;
  const x2 = line.x2 ?? 0;
  const y2 = line.y2 ?? 0;
  const angleDeg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  canvas.remove(line);

  const shaft = new Line([x1, y1, x2, y2], { stroke: "#1f2937", strokeWidth: 3 });
  const head = new Triangle({
    left: x2,
    top: y2,
    originX: "center",
    originY: "center",
    width: 14,
    height: 16,
    fill: "#1f2937",
    angle: angleDeg + 90,
  });

  const group = new Group([shaft, head]);
  canvas.add(group);
  canvas.setActiveObject(group);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const commaIndex = dataUrl.indexOf(",");
  const header = dataUrl.slice(0, commaIndex);
  const base64 = dataUrl.slice(commaIndex + 1);
  const mime = header.match(/data:(.*);base64/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
