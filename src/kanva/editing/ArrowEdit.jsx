import {
  InputNumber,
  Slider,
  ColorPicker,
  Typography,
  Flex,
  Select,
  Switch,
} from "../components/UIControls";
import styles from "./editing.module.css";

const ArrowEdit = ({ selectedEl, setElement }) => {
  if (!selectedEl) return null;
  const update = (k, v) => setElement(selectedEl?.id, (el) => ({ ...el, [k]: v }));

  const isDashed = Array.isArray(selectedEl?.dash) && selectedEl?.dash?.length > 0;
  const dashLength = isDashed ? (selectedEl?.dash?.[0] ?? 10) : 10;
  const dashGap = isDashed ? (selectedEl?.dash?.[1] ?? 5) : 5;

  const p = selectedEl?.points || [0, 0, 150, 0];

  const handleStrokeStyleChange = (value) => {
    if (value === "solid") {
      update("dash", []);
    } else {
      update("dash", [dashLength, dashGap]);
    }
  };

  return (
    <div className={styles.container}>
      {/* Position & Rotation */}
      <p className={styles.sectionTitle}>Position &amp; Rotation</p>
      <div className={styles.row}>
        <span className={styles.label}>X</span>
        <InputNumber value={selectedEl?.x || 0} onChange={(v) => update("x", v)} />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Y</span>
        <InputNumber value={selectedEl?.y || 0} onChange={(v) => update("y", v)} />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Rotation</span>
        <InputNumber
          value={selectedEl?.rotation || 0}
          onChange={(v) => update("rotation", v)}
        />
      </div>

      {/* Start / End points (local to the arrow group) */}
      <p className={styles.sectionTitle}>Points (local)</p>
      <div className={styles.row}>
        <span className={styles.label}>Start X</span>
        <InputNumber
          value={p[0]}
          onChange={(v) => update("points", [v, p[1], p[2], p[3]])}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Start Y</span>
        <InputNumber
          value={p[1]}
          onChange={(v) => update("points", [p[0], v, p[2], p[3]])}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>End X</span>
        <InputNumber
          value={p[2]}
          onChange={(v) => update("points", [p[0], p[1], v, p[3]])}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>End Y</span>
        <InputNumber
          value={p[3]}
          onChange={(v) => update("points", [p[0], p[1], p[2], v])}
        />
      </div>

      {/* Arrow head */}
      <p className={styles.sectionTitle}>Arrow Head</p>
      <div className={styles.row}>
        <span className={styles.label}>Pointer Length</span>
        <InputNumber
          value={selectedEl?.pointerLength || 15}
          onChange={(v) => update("pointerLength", v)}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Pointer Width</span>
        <InputNumber
          value={selectedEl?.pointerWidth || 15}
          onChange={(v) => update("pointerWidth", v)}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Arrow at Start</span>
        <Switch
          checked={!!selectedEl?.pointerAtBeginning}
          onChange={(v) => update("pointerAtBeginning", v)}
        />
      </div>

      {/* Stroke + Fill */}
      <p className={styles.sectionTitle}>Stroke &amp; Fill</p>
      <div className={styles.colorRow}>
        <span className={styles.label}>Fill</span>
        <ColorPicker
          value={selectedEl?.fill ?? selectedEl?.stroke ?? "#000"}
          onChange={(c) => update("fill", c?.toHexString())}
        />
      </div>
      <div className={styles.colorRow}>
        <span className={styles.label}>Stroke</span>
        <ColorPicker
          value={selectedEl?.stroke || "#000"}
          onChange={(c) => update("stroke", c?.toHexString())}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Stroke Width</span>
        <InputNumber
          value={selectedEl?.strokeWidth || 2}
          onChange={(v) => update("strokeWidth", v)}
        />
      </div>

      {/* Caps / Joins */}
      <p className={styles.sectionTitle}>Caps &amp; Joins</p>
      <div className={styles.row}>
        <span className={styles.label}>Line Cap</span>
        <Select
          value={selectedEl?.lineCap || "round"}
          onChange={(v) => update("lineCap", v)}
          options={[
            { label: "Butt", value: "butt" },
            { label: "Round", value: "round" },
            { label: "Square", value: "square" },
          ]}
          style={{ width: 120 }}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Line Join</span>
        <Select
          value={selectedEl?.lineJoin || "round"}
          onChange={(v) => update("lineJoin", v)}
          options={[
            { label: "Miter", value: "miter" },
            { label: "Round", value: "round" },
            { label: "Bevel", value: "bevel" },
          ]}
          style={{ width: 120 }}
        />
      </div>

      {/* Stroke Style */}
      <p className={styles.sectionTitle}>Stroke Style</p>
      <div className={styles.row}>
        <span className={styles.label}>Type</span>
        <Select
          value={isDashed ? "dashed" : "solid"}
          onChange={handleStrokeStyleChange}
          options={[
            { label: "Solid", value: "solid" },
            { label: "Dashed", value: "dashed" },
          ]}
          style={{ width: 120 }}
        />
      </div>
      {isDashed && (
        <>
          <div className={styles.row}>
            <span className={styles.label}>Dash Length</span>
            <InputNumber
              value={dashLength}
              min={1}
              onChange={(v) => update("dash", [v || 1, dashGap])}
            />
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Dash Gap</span>
            <InputNumber
              value={dashGap}
              min={1}
              onChange={(v) => update("dash", [dashLength, v || 1])}
            />
          </div>
        </>
      )}

      {/* Opacity */}
      <p className={styles.sectionTitle}>Opacity</p>
      <Slider
        min={0}
        max={1}
        step={0.05}
        value={selectedEl?.opacity ?? 1}
        onChange={(v) => update("opacity", v)}
      />

      {/* Blur */}
      <div className={styles.row}>
        <span className={styles.label}>Blur</span>
        <InputNumber
          value={selectedEl?.blurRadius || 0}
          onChange={(v) => update("blurRadius", v)}
        />
      </div>

      {/* Shadow */}
      <p className={styles.sectionTitle}>Shadow</p>
      <div className={styles.colorRow}>
        <span className={styles.label}>Color</span>
        <ColorPicker
          value={selectedEl?.shadowColor || "#000"}
          onChange={(c) => update("shadowColor", c?.toHexString())}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Blur</span>
        <InputNumber
          value={selectedEl?.shadowBlur || 0}
          onChange={(v) => update("shadowBlur", v)}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Offset X</span>
        <InputNumber
          value={selectedEl?.shadowOffsetX || 0}
          onChange={(v) => update("shadowOffsetX", v)}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Offset Y</span>
        <InputNumber
          value={selectedEl?.shadowOffsetY || 0}
          onChange={(v) => update("shadowOffsetY", v)}
        />
      </div>
      <p className={styles.label}>Shadow Opacity</p>
      <Slider
        min={0}
        max={1}
        step={0.05}
        value={selectedEl?.shadowOpacity ?? 1}
        onChange={(v) => update("shadowOpacity", v)}
      />

      {/* Toggles */}
      <p className={styles.sectionTitle}>Options</p>
      <div className={styles.row}>
        <span className={styles.label}>Stroke Scales on Resize</span>
        <Switch
          checked={!!selectedEl?.strokeScaleEnabled}
          onChange={(v) => update("strokeScaleEnabled", v)}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Locked</span>
        <Switch
          checked={!!selectedEl?.locked}
          onChange={(v) => update("locked", v)}
        />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Visible</span>
        <Switch
          checked={selectedEl?.visible !== false}
          onChange={(v) => update("visible", v)}
        />
      </div>
    </div>
  );
};

export default ArrowEdit;
