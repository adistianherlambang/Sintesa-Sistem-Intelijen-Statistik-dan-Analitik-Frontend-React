import React from "react";
import { ColorPicker, InputNumber, Select, Switch } from "../components/UIControls";
import { FaTrash, FaPlus } from "react-icons/fa";
import styles from "./editing.module.css";

export default function ChartEdit({ selectedEl, setElement }) {
    if (!selectedEl) return null;

    const data = selectedEl.data || [];
    const colors = selectedEl.colors || ["#AD6832", "#F4913E", "#FEBD23"];

    const handleDataChange = (index, key, val) => {
        const newData = data.map((item, idx) => {
            if (idx === index) {
                return { ...item, [key]: val };
            }
            return item;
        });
        setElement(selectedEl.id, (el) => ({ ...el, data: newData }));
    };

    const addDataItem = () => {
        const newData = [...data, { label: `Data ${data.length + 1}`, value: 10 }];
        setElement(selectedEl.id, (el) => ({ ...el, data: newData }));
    };

    const removeDataItem = (index) => {
        if (data.length <= 1) return;
        const newData = data.filter((_, idx) => idx !== index);
        setElement(selectedEl.id, (el) => ({ ...el, data: newData }));
    };

    const handleColorChange = (colorIndex, hexColor) => {
        const newColors = [...colors];
        newColors[colorIndex] = hexColor;
        setElement(selectedEl.id, (el) => ({ ...el, colors: newColors }));
    };

    const addColor = () => {
        const newColors = [...colors, "#34B34A"];
        setElement(selectedEl.id, (el) => ({ ...el, colors: newColors }));
    };

    const removeColor = (colorIndex) => {
        if (colors.length <= 1) return;
        const newColors = colors.filter((_, idx) => idx !== colorIndex);
        setElement(selectedEl.id, (el) => ({ ...el, colors: newColors }));
    };

    return (
        <div className={styles.container}>
            {/* Chart Type */}
            <p className={styles.sectionTitle}>Tipe Grafik</p>
            <Select
                style={{ width: "100%" }}
                value={selectedEl.chartType || "bar"}
                onChange={(value) => setElement(selectedEl.id, (el) => ({
                    ...el,
                    chartType: value,
                }))}
                options={[
                    { value: "bar", label: "Grafik Batang (Bar)" },
                    { value: "line", label: "Grafik Garis (Line)" },
                    { value: "pie", label: "Grafik Lingkaran (Pie)" },
                ]}
            />

            {/* Styling */}
            <p className={styles.sectionTitle}>Tampilan Label & Nilai</p>
            <div className={styles.row} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className={styles.label}>Tampilkan Label Sumbu</span>
                <Switch
                    checked={selectedEl.showLabels !== false}
                    onChange={(checked) => setElement(selectedEl.id, (el) => ({ ...el, showLabels: checked }))}
                />
            </div>
            <div className={styles.row} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span className={styles.label}>Tampilkan Nilai Data</span>
                <Switch
                    checked={selectedEl.showValues !== false}
                    onChange={(checked) => setElement(selectedEl.id, (el) => ({ ...el, showValues: checked }))}
                />
            </div>

            {/* Typography */}
            <p className={styles.sectionTitle}>Gaya Teks</p>
            <div className={styles.row}>
                <span className={styles.label}>Ukuran Font</span>
                <InputNumber
                    min={4}
                    max={24}
                    value={selectedEl.fontSize || 8}
                    onChange={(val) => setElement(selectedEl.id, (el) => ({ ...el, fontSize: val || 8 }))}
                />
            </div>
            <div className={styles.colorRow}>
                <span className={styles.label}>Warna Teks</span>
                <ColorPicker
                    value={selectedEl.textColor || "#111827"}
                    onChange={(c) => setElement(selectedEl.id, (el) => ({ ...el, textColor: c.toHexString() }))}
                />
            </div>

            {/* Colors Palette */}
            <p className={styles.sectionTitle}>Skema Warna Grafik</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {colors.map((color, idx) => (
                    <div key={`color-${idx}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ColorPicker
                            value={color}
                            onChange={(c) => handleColorChange(idx, c.toHexString())}
                        />
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Warna {idx + 1}</span>
                        {colors.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeColor(idx)}
                                style={{ marginLeft: "auto", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                            >
                                <FaTrash size={12} />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addColor}
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px dashed rgba(255,255,255,0.2)",
                        color: "#fff",
                        padding: "6px",
                        borderRadius: "4px",
                        fontSize: 11,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4
                    }}
                >
                    <FaPlus size={10} /> Tambah Warna
                </button>
            </div>

            {/* Grid Line Color */}
            {selectedEl.chartType !== "pie" && (
                <div className={styles.colorRow}>
                    <span className={styles.label}>Warna Garis Grid</span>
                    <ColorPicker
                        value={selectedEl.gridColor || "rgba(0,0,0,0.1)"}
                        onChange={(c) => setElement(selectedEl.id, (el) => ({ ...el, gridColor: c.toHexString() }))}
                    />
                </div>
            )}

            {/* Data Editor Table */}
            <p className={styles.sectionTitle} style={{ marginTop: 16 }}>Data Grafik</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.map((item, idx) => (
                    <div key={`data-item-${idx}`} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleDataChange(idx, "label", e.target.value)}
                            placeholder="Label"
                            style={{
                                flex: 2,
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "#fff",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: 12
                            }}
                        />
                        <input
                            type="number"
                            value={item.value}
                            onChange={(e) => handleDataChange(idx, "value", parseFloat(e.target.value) || 0)}
                            placeholder="Nilai"
                            style={{
                                flex: 1,
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "#fff",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: 12,
                                width: 60
                            }}
                        />
                        {data.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeDataItem(idx)}
                                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}
                            >
                                <FaTrash size={12} />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addDataItem}
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px dashed rgba(255,255,255,0.2)",
                        color: "#fff",
                        padding: "6px",
                        borderRadius: "4px",
                        fontSize: 11,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4
                    }}
                >
                    <FaPlus size={10} /> Tambah Data Row
                </button>
            </div>
        </div>
    );
}
