import {
    InputNumber,
    Slider,
    ColorPicker,
    Typography,
    Flex,
    Select,
} from "../components/UIControls";
import styles from "./editing.module.css";

const PolygonEdit = ({ selectedEl, setElement }) => {
    if (!selectedEl) return null;

    const update = (key, value) => {
        setElement(selectedEl?.id, (el) => ({ ...el, [key]: value }));
    };

    return (
        <div className={styles.container}>
            {/* Position */}
            <p className={styles.sectionTitle}>Position</p>
            <div className={styles.row}>
                <span className={styles.label}>Position X</span>
                <InputNumber value={selectedEl?.x} onChange={(v) => update("x", v)} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Position Y</span>
                <InputNumber value={selectedEl?.y} onChange={(v) => update("y", v)} />
            </div>

            {/* Polygon size */}
            <p className={styles.sectionTitle}>Shape</p>
            <div className={styles.row}>
                <span className={styles.label}>Sides</span>
                <InputNumber
                    min={3}
                    max={12}
                    value={selectedEl?.sides || 5}
                    onChange={(v) => update("sides", v)}
                />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Radius</span>
                <InputNumber
                    value={selectedEl?.radius || 60}
                    onChange={(v) => update("radius", v)}
                />
            </div>

            {/* Fill & Stroke */}
            <p className={styles.sectionTitle}>Fill &amp; Stroke</p>
            <div className={styles.colorRow}>
                <span className={styles.label}>Fill</span>
                <ColorPicker
                    value={selectedEl?.fill || "#fff"}
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
                    value={selectedEl?.strokeWidth || 1}
                    onChange={(v) => update("strokeWidth", v)}
                />
            </div>

            {/* LineCap & LineJoin */}
            <p className={styles.sectionTitle}>Caps &amp; Joins</p>
            <div className={styles.row}>
                <span className={styles.label}>Line Cap</span>
                <Select
                    value={selectedEl?.lineCap || "butt"}
                    onChange={(v) => update("lineCap", v)}
                    options={[
                        { value: "butt", label: "Butt" },
                        { value: "round", label: "Round" },
                        { value: "square", label: "Square" },
                    ]}
                />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Line Join</span>
                <Select
                    value={selectedEl?.lineJoin || "miter"}
                    onChange={(v) => update("lineJoin", v)}
                    options={[
                        { value: "miter", label: "Miter" },
                        { value: "round", label: "Round" },
                        { value: "bevel", label: "Bevel" },
                    ]}
                />
            </div>

            {/* Dash Style */}
            <p className={styles.sectionTitle}>Dash Style</p>
            <div className={styles.row}>
                <span className={styles.label}>Dash length</span>
                <InputNumber
                    value={selectedEl?.dash?.[0] || 0}
                    onChange={(v) =>
                        update("dash", [v, selectedEl?.dash?.[1] || 0])
                    }
                />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Dash gap</span>
                <InputNumber
                    value={selectedEl?.dash?.[1] || 0}
                    onChange={(v) =>
                        update("dash", [selectedEl?.dash?.[0] || 0, v])
                    }
                />
            </div>

            {/* Opacity */}
            <p className={styles.sectionTitle}>Opacity</p>
            <Slider
                min={0}
                max={1}
                step={0.05}
                value={selectedEl?.opacity ?? 1}
                onChange={(v) => update("opacity", v)}
            />

            {/* Shadow */}
            <p className={styles.sectionTitle}>Shadow</p>
            <div className={styles.colorRow}>
                <span className={styles.label}>Shadow Color</span>
                <ColorPicker
                    value={selectedEl?.shadowColor || "#000"}
                    onChange={(c) => update("shadowColor", c?.toHexString())}
                />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Shadow Blur</span>
                <InputNumber
                    value={selectedEl?.shadowBlur || 0}
                    onChange={(v) => update("shadowBlur", v)}
                />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Shadow Offset X</span>
                <InputNumber
                    value={selectedEl?.shadowOffsetX || 0}
                    onChange={(v) => update("shadowOffsetX", v)}
                />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Shadow Offset Y</span>
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
        </div>
    );
};

export default PolygonEdit;
