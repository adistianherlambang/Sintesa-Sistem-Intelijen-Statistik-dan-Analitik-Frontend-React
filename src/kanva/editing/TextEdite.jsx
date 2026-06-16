import { ColorPicker, InputNumber, Select, Slider, Switch } from "../components/UIControls";
import { CiTextAlignLeft, CiTextAlignCenter, CiTextAlignRight } from "react-icons/ci";
import { FaBold, FaItalic, FaUnderline, FaStrikethrough } from "react-icons/fa6";
import { ImTextHeight } from "react-icons/im";
import styles from "./editing.module.css";

const TextEdite = ({ selectedEl, setElement, toggle }) => {
    return (
        <div className={styles.container}>
            {/* Font Size */}
            <p className={styles.sectionTitle}>Font Size</p>
            <div className={styles.addonRow}>
                <span className={styles.addonIcon}><ImTextHeight size={16} /></span>
                <InputNumber
                    className={styles.inputFull}
                    min={6}
                    value={selectedEl?.fontSize || 16}
                    onChange={(value) =>
                        setElement(selectedEl?.id, (el) => ({
                            ...el,
                            fontSize: value || 16,
                        }))
                    }
                />
            </div>

            {/* Font Align */}
            <p className={styles.sectionTitle}>Font Align</p>
            <div className={styles.btnGroup}>
                <button
                    className={`${styles.btn} ${selectedEl?.align === "left" ? styles.btnActive : ""}`}
                    onClick={() => setElement(selectedEl?.id, (el) => ({ ...el, align: "left" }))}
                >
                    <CiTextAlignLeft size={18} />
                </button>
                <button
                    className={`${styles.btn} ${selectedEl?.align === "center" ? styles.btnActive : ""}`}
                    onClick={() => setElement(selectedEl?.id, (el) => ({ ...el, align: "center" }))}
                >
                    <CiTextAlignCenter size={18} />
                </button>
                <button
                    className={`${styles.btn} ${selectedEl?.align === "right" ? styles.btnActive : ""}`}
                    onClick={() => setElement(selectedEl?.id, (el) => ({ ...el, align: "right" }))}
                >
                    <CiTextAlignRight size={18} />
                </button>
            </div>

            {/* Font Style */}
            <p className={styles.sectionTitle}>Font Style</p>
            <div className={styles.btnGroup}>
                <button className={`${styles.btn} ${selectedEl?.bold ? styles.btnActive : ""}`} onClick={() => toggle("bold")}>
                    <FaBold size={14} />
                </button>
                <button className={`${styles.btn} ${selectedEl?.italic ? styles.btnActive : ""}`} onClick={() => toggle("italic")}>
                    <FaItalic size={14} />
                </button>
                <button className={`${styles.btn} ${selectedEl?.underline ? styles.btnActive : ""}`} onClick={() => toggle("underline")}>
                    <FaUnderline size={14} />
                </button>
                <button className={`${styles.btn} ${selectedEl?.lineThrough ? styles.btnActive : ""}`} onClick={() => toggle("lineThrough")}>
                    <FaStrikethrough size={14} />
                </button>
            </div>

            {/* Font Case */}
            <p className={styles.sectionTitle}>Font Case</p>
            <Select
                style={{ width: "100%" }}
                value={selectedEl?.textTransform || "none"}
                onChange={(value) => setElement(selectedEl?.id, (el) => ({
                    ...el,
                    textTransform: value,
                }))}
                options={[
                    { value: "none", label: "None" },
                    { value: "lowercase", label: "Lowercase" },
                    { value: "uppercase", label: "Uppercase" },
                ]}
            />

            {/* Font Stroke */}
            <p className={styles.sectionTitle}>Font Stroke</p>
            <div className={styles.colorRow}>
                <span className={styles.label}>Color</span>
                <ColorPicker
                    value={selectedEl?.stroke || "#000"}
                    onChange={(c) => setElement(selectedEl?.id, (el) => ({ ...el, stroke: c.toHexString() }))}
                />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Width</span>
                <InputNumber
                    min={0}
                    value={selectedEl?.strokeWidth || 0}
                    onChange={(val) =>
                        setElement(selectedEl?.id, (el) => ({
                            ...el,
                            strokeWidth: val,
                        }))
                    }
                />
            </div>

            {/* Line Height */}
            <p className={styles.sectionTitle}>Line Height</p>
            <Slider min={0.5} max={3} step={0.1} value={selectedEl?.lineHeight || 1}
                onChange={(val) => setElement(selectedEl?.id, (el) => ({ ...el, lineHeight: val }))}
            />

            {/* Letter Spacing */}
            <p className={styles.sectionTitle}>Letter Spacing</p>
            <Slider min={-5} max={20} step={0.5} value={selectedEl?.letterSpacing || 0}
                onChange={(val) => setElement(selectedEl?.id, (el) => ({ ...el, letterSpacing: val }))}
            />

            {/* Padding */}
            <div className={styles.row}>
                <span className={styles.label}>Padding</span>
                <InputNumber min={0} value={selectedEl?.padding || 0}
                    onChange={(val) => setElement(selectedEl?.id, (el) => ({ ...el, padding: val }))}
                />
            </div>

            {/* Shadow */}
            <p className={styles.sectionTitle}>Shadow</p>
            <div className={styles.colorRow}>
                <span className={styles.label}>Color</span>
                <ColorPicker
                    value={selectedEl?.shadowColor || "#000"}
                    onChange={(c) => setElement(selectedEl?.id, (el) => ({ ...el, shadowColor: c.toHexString() }))}
                />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Blur</span>
                <InputNumber min={0} value={selectedEl?.shadowBlur || 0}
                    onChange={(val) =>
                        setElement(selectedEl?.id, (el) => ({
                            ...el,
                            shadowBlur: val,
                        }))
                    }
                />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Offset X</span>
                <InputNumber value={selectedEl?.shadowOffsetX || 0}
                    onChange={(val) =>
                        setElement(selectedEl?.id, (el) => ({
                            ...el,
                            shadowOffsetX: val,
                        }))}
                />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Offset Y</span>
                <InputNumber value={selectedEl?.shadowOffsetY || 0}
                    onChange={(val) =>
                        setElement(selectedEl?.id, (el) => ({
                            ...el,
                            shadowOffsetY: val,
                        }))
                    }
                />
            </div>

            {/* Opacity */}
            <p className={styles.sectionTitle}>Opacity</p>
            <Slider min={0} max={1} step={0.05} value={selectedEl?.shadowOpacity || 1}
                onChange={(val) =>
                    setElement(selectedEl?.id, (el) => ({
                        ...el,
                        shadowOpacity: val,
                    }))
                }
            />
        </div>
    );
};

export default TextEdite;