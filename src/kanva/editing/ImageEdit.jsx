import { InputNumber, Slider, Button, Switch, Divider, Typography, Flex, Tooltip, ColorPicker } from "../components/UIControls";
import styles from "./editing.module.css";

const ImageEdit = ({ selectedEl, setElement }) => {
    if (selectedEl?.type !== "image") return null;

    return (
        <div className={styles.container}>
            {/* Size */}
            <p className={styles.sectionTitle}>Size</p>
            <div className={styles.row}>
                <span className={styles.label}>Width</span>
                <InputNumber min={10} value={selectedEl?.width} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, width: v }))} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Height</span>
                <InputNumber min={10} value={selectedEl?.height} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, height: v }))} />
            </div>

            {/* Opacity */}
            <p className={styles.sectionTitle}>Opacity</p>
            <Slider min={0} max={1} step={0.05} value={selectedEl?.opacity ?? 1} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, opacity: v }))} />

            {/* Flip */}
            <p className={styles.sectionTitle}>Flip</p>
            <div className={styles.btnGroup}>
                <button
                    className={styles.btn}
                    onClick={() => setElement(selectedEl?.id, (el) => ({ ...el, flipH: !el?.flipH }))}
                >
                    Flip H
                </button>
                <button
                    className={styles.btn}
                    onClick={() => setElement(selectedEl?.id, (el) => ({ ...el, flipV: !el.flipV }))}
                >
                    Flip V
                </button>
            </div>

            {/* Effects */}
            <p className={styles.sectionTitle}>Effects</p>
            <div className={styles.row}>
                <span className={styles.label}>Grayscale</span>
                <Switch checked={selectedEl?.grayscale} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, grayscale: v }))} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Sepia</span>
                <Switch checked={selectedEl?.sepia} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, sepia: v }))} />
            </div>

            {/* Adjustments */}
            <p className={styles.sectionTitle}>Adjustments</p>
            <p className={styles.label}>Blur</p>
            <Slider min={0} max={20} value={selectedEl?.blur || 0} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, blur: v }))} />
            <p className={styles.label}>Brightness</p>
            <Slider min={-1} max={1} step={0.1} value={selectedEl?.brightness || 0} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, brightness: v }))} />
            <p className={styles.label}>Contrast</p>
            <Slider min={-100} max={100} value={selectedEl?.contrast || 0} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, contrast: v }))} />
            <p className={styles.label}>Saturation</p>
            <Slider min={-2} max={2} step={0.1} value={selectedEl?.saturation || 0} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, saturation: v }))} />

            {/* Border */}
            <p className={styles.sectionTitle}>Border</p>
            <div className={styles.colorRow}>
                <span className={styles.label}>Border Color</span>
                <ColorPicker value={selectedEl?.borderColor || "#000"} onChange={(value) => setElement(selectedEl?.id, (el) => ({ ...el, borderColor: value.toRgbString() }))} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Border Width</span>
                <InputNumber value={selectedEl?.borderWidth || 0} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, borderWidth: v }))} />
            </div>

            {/* Corner Radius */}
            <p className={styles.sectionTitle}>Corner Radius</p>
            <Slider
                min={0}
                max={100}
                value={selectedEl?.cornerRadius || 0}
                onChange={(v) =>
                    setElement(selectedEl?.id, (el) => ({ ...el, cornerRadius: v }))
                }
            />

            {/* Shadow */}
            <p className={styles.sectionTitle}>Shadow</p>
            <div className={styles.colorRow}>
                <span className={styles.label}>Shadow Color</span>
                <ColorPicker value={selectedEl?.shadowColor || "#000"} onChange={(value) => setElement(selectedEl?.id, (el) => ({ ...el, shadowColor: value?.toRgbString() }))} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Shadow Blur</span>
                <InputNumber value={selectedEl?.shadowBlur || 0} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, shadowBlur: v }))} />
            </div>
            <p className={styles.label}>Shadow Opacity</p>
            <Slider min={0} max={1} step={0.05} value={selectedEl?.shadowOpacity || 0} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, shadowOpacity: v }))} />
            <div className={styles.row}>
                <span className={styles.label}>Offset X</span>
                <InputNumber value={selectedEl?.shadowOffsetX || 0} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, shadowOffsetX: v }))} />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Offset Y</span>
                <InputNumber value={selectedEl?.shadowOffsetY || 0} onChange={(v) => setElement(selectedEl?.id, (el) => ({ ...el, shadowOffsetY: v }))} />
            </div>
        </div>
    );
};

export default ImageEdit;