import {
    InputNumber,
    Slider,
    ColorPicker,
    Typography,
    Flex,
} from "../components/UIControls";
import styles from "./editing.module.css";

const RectangleEdit = ({ selectedEl, setElement }) => {
    if (!selectedEl) return null;

    const update = (key, value) => {
        setElement(selectedEl?.id, (el) => ({ ...el, [key]: value }));
    };

    return (
        <div className={styles.container}>
            {/* Position & Size */}
            <p className={styles.sectionTitle}>Position &amp; Size</p>
            <div className={styles.row}>
                <span className={styles.label}>Position X</span>
                <InputNumber value={selectedEl?.x} onChange={(v) => update("x", v)} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Position Y</span>
                <InputNumber value={selectedEl?.y} onChange={(v) => update("y", v)} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Width</span>
                <InputNumber value={selectedEl?.width} onChange={(v) => update("width", v)} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Height</span>
                <InputNumber value={selectedEl?.height} onChange={(v) => update("height", v)} />
            </div>

            {/* Stroke */}
            <p className={styles.sectionTitle}>Stroke</p>
            <div className={styles.colorRow}>
                <span className={styles.label}>Stroke</span>
                <ColorPicker value={selectedEl?.stroke || "#000"} onChange={(c) => update("stroke", c?.toHexString())} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Stroke Width</span>
                <InputNumber value={selectedEl?.strokeWidth || 0} onChange={(v) => update("strokeWidth", v)} />
            </div>

            {/* Dash */}
            <p className={styles.sectionTitle}>Dash Style</p>
            <div className={styles.row}>
                <span className={styles.label}>Dash length</span>
                <InputNumber placeholder="Dash length" onChange={(v) => update("dash", [v, selectedEl?.dash?.[1] || 0])} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Dash Gap</span>
                <InputNumber placeholder="Gap" onChange={(v) => update("dash", [selectedEl?.dash?.[0] || 0, v])} />
            </div>

            {/* Opacity */}
            <p className={styles.sectionTitle}>Opacity</p>
            <Slider min={0} max={1} step={0.05} value={selectedEl?.opacity ?? 1} onChange={(v) => update("opacity", v)} />

            {/* Corner Radius simple */}
            <div className={styles.row}>
                <span className={styles.label}>Corner Radius</span>
                <InputNumber value={selectedEl?.cornerRadius || 0} onChange={(v) => update("cornerRadius", v)} />
            </div>

            {/* Shadow */}
            <p className={styles.sectionTitle}>Shadow</p>
            <div className={styles.colorRow}>
                <span className={styles.label}>Shadow Color</span>
                <ColorPicker value={selectedEl?.shadowColor || "#000"} onChange={(c) => update("shadowColor", c?.toHexString())} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Shadow Blur</span>
                <InputNumber value={selectedEl?.shadowBlur || 0} onChange={(v) => update("shadowBlur", v)} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Shadow Offset X</span>
                <InputNumber value={selectedEl?.shadowOffsetX || 0} onChange={(v) => update("shadowOffsetX", v)} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Shadow Offset Y</span>
                <InputNumber value={selectedEl?.shadowOffsetY || 0} onChange={(v) => update("shadowOffsetY", v)} />
            </div>
            <p className={styles.label}>Shadow Opacity</p>
            <Slider min={0} max={1} step={0.05} value={selectedEl?.shadowOpacity ?? 1} onChange={(v) => update("shadowOpacity", v)} />

            {/* All Corner Radius */}
            <p className={styles.sectionTitle}>All Corner Radius</p>
            <div className={styles.cornerGrid}>
                <div className={styles.cornerCell}>
                    <span className={styles.cornerLabel}>Top Left</span>
                    <InputNumber
                        value={Array?.isArray(selectedEl?.cornerRadius) ? selectedEl?.cornerRadius[0] : 0}
                        onChange={(v) => {
                            let cr = Array?.isArray(selectedEl?.cornerRadius) ? [...selectedEl?.cornerRadius] : [0, 0, 0, 0];
                            cr[0] = v;
                            update("cornerRadius", cr);
                        }}
                    />
                </div>
                <div className={styles.cornerCell}>
                    <span className={styles.cornerLabel}>Top Right</span>
                    <InputNumber
                        value={Array?.isArray(selectedEl?.cornerRadius) ? selectedEl?.cornerRadius[1] : 0}
                        onChange={(v) => {
                            let cr = Array?.isArray(selectedEl?.cornerRadius) ? [...selectedEl?.cornerRadius] : [0, 0, 0, 0];
                            cr[1] = v;
                            update("cornerRadius", cr);
                        }}
                    />
                </div>
                <div className={styles.cornerCell}>
                    <span className={styles.cornerLabel}>Bottom Left</span>
                    <InputNumber
                        value={Array?.isArray(selectedEl?.cornerRadius) ? selectedEl?.cornerRadius[3] : 0}
                        onChange={(v) => {
                            let cr = Array?.isArray(selectedEl?.cornerRadius) ? [...selectedEl?.cornerRadius] : [0, 0, 0, 0];
                            cr[3] = v;
                            update("cornerRadius", cr);
                        }}
                    />
                </div>
                <div className={styles.cornerCell}>
                    <span className={styles.cornerLabel}>Bottom Right</span>
                    <InputNumber
                        value={Array?.isArray(selectedEl?.cornerRadius) ? selectedEl?.cornerRadius[2] : 0}
                        onChange={(v) => {
                            let cr = Array?.isArray(selectedEl?.cornerRadius) ? [...selectedEl?.cornerRadius] : [0, 0, 0, 0];
                            cr[2] = v;
                            update("cornerRadius", cr);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default RectangleEdit;
