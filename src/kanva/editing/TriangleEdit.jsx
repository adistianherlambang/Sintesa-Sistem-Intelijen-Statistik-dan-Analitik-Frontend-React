import {
    InputNumber,
    Slider,
    ColorPicker,
    Typography,
    Flex,
    Switch,
} from "../components/UIControls";
import styles from "./editing.module.css";

const TriangleEdit = ({ selectedEl, setElement }) => {
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
                <InputNumber value={selectedEl.y} onChange={(v) => update("y", v)} />
            </div>

            {/* Size */}
            <p className={styles.sectionTitle}>Size</p>
            <div className={styles.row}>
                <span className={styles.label}>Radius (size)</span>
                <InputNumber
                    value={selectedEl?.radius || 60}
                    onChange={(v) => update("radius", v)}
                />
            </div>

            {/* Rotation */}
            <div className={styles.row}>
                <span className={styles.label}>Rotation</span>
                <InputNumber
                    value={selectedEl?.rotation || 0}
                    onChange={(v) => update("rotation", v)}
                />
            </div>

            {/* Polygon sides */}
            <div className={styles.row}>
                <span className={styles.label}>Sides</span>
                <InputNumber
                    min={3}
                    max={12}
                    value={selectedEl?.sides || 3}
                    onChange={(v) => update("sides", v)}
                />
            </div>

            {/* Fill & Stroke */}
            <p className={styles.sectionTitle}>Fill &amp; Stroke</p>
            <div className={styles.colorRow}>
                <span className={styles.label}>Fill</span>
                <ColorPicker
                    value={selectedEl?.fill || "#fff"}
                    onChange={(c) => update("fill", c.toHexString())}
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

            {/* Dash Style */}
            <p className={styles.sectionTitle}>Dash Style</p>
            <div className={styles.row}>
                <span className={styles.label}>Dash length</span>
                <InputNumber
                    value={selectedEl?.dash?.[0] || 0}
                    onChange={(v) => update("dash", [v, selectedEl?.dash?.[1] || 0])}
                />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Dash gap</span>
                <InputNumber
                    value={selectedEl?.dash?.[1] || 0}
                    onChange={(v) => update("dash", [selectedEl?.dash?.[0] || 0, v])}
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

            {/* Lock / Visible */}
            <p className={styles.sectionTitle}>Options</p>
            <div className={styles.row}>
                <span className={styles.label}>Locked</span>
                <Switch
                    checked={selectedEl?.locked || false}
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

export default TriangleEdit;
