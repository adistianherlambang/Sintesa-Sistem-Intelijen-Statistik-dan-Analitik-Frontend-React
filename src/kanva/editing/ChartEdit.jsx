import React from "react";
import { ColorPicker, InputNumber, Select, Switch } from "../components/UIControls";
import { FaTrash, FaPlus } from "react-icons/fa";
import styles from "./editing.module.css";

export default function ChartEdit({ selectedEl, setElement }) {
    if (!selectedEl) return null;

    const data = selectedEl.data || [];
    const colors = selectedEl.colors || ["#AD6832", "#F4913E", "#FEBD23"];
    const seriesNames = selectedEl.seriesNames || ["Seri 1", "Seri 2"];
    const isGrouped = selectedEl.chartType === "groupedBar";

    const handleDataChange = (index, key, val) => {
        const newData = data.map((item, idx) => {
            if (idx === index) {
                return { ...item, [key]: val };
            }
            return item;
        });
        setElement(selectedEl.id, (el) => ({ ...el, data: newData }));
    };

    const handleGroupedValueChange = (rowIndex, subIndex, val) => {
        const newData = data.map((item, rIdx) => {
            if (rIdx === rowIndex) {
                const existingValues = Array.isArray(item.values)
                    ? [...item.values]
                    : [item.value !== undefined ? item.value : 0];
                existingValues[subIndex] = val;
                return { ...item, values: existingValues };
            }
            return item;
        });
        setElement(selectedEl.id, (el) => ({ ...el, data: newData }));
    };

    const addDataItem = () => {
        let newItem;
        if (isGrouped) {
            newItem = { label: `Data ${data.length + 1}`, values: Array(seriesNames.length).fill(10) };
        } else {
            newItem = { label: `Data ${data.length + 1}`, value: 10 };
        }
        const newData = [...data, newItem];
        setElement(selectedEl.id, (el) => ({ ...el, data: newData }));
    };

    const removeDataItem = (index) => {
        if (data.length <= 1) return;
        const newData = data.filter((_, idx) => idx !== index);
        setElement(selectedEl.id, (el) => ({ ...el, data: newData }));
    };

    const addSeries = () => {
        const newSeriesNames = [...seriesNames, `Seri ${seriesNames.length + 1}`];
        const newData = data.map((item) => {
            const existingValues = Array.isArray(item.values)
                ? item.values
                : [item.value !== undefined ? item.value : 0];
            return { ...item, values: [...existingValues, 10] };
        });
        let newColors = [...colors];
        if (newColors.length < newSeriesNames.length) {
            newColors.push("#34B34A");
        }
        setElement(selectedEl.id, (el) => ({
            ...el,
            seriesNames: newSeriesNames,
            colors: newColors,
            data: newData,
        }));
    };

    const removeSeries = (sIdx) => {
        if (seriesNames.length <= 1) return;
        const newSeriesNames = seriesNames.filter((_, idx) => idx !== sIdx);
        const newData = data.map((item) => {
            const existingValues = Array.isArray(item.values)
                ? item.values
                : [item.value !== undefined ? item.value : 0];
            const newValues = existingValues.filter((_, idx) => idx !== sIdx);
            return { ...item, values: newValues };
        });
        setElement(selectedEl.id, (el) => ({
            ...el,
            seriesNames: newSeriesNames,
            data: newData,
        }));
    };

    const handleSeriesNameChange = (sIdx, name) => {
        const newSeriesNames = [...seriesNames];
        newSeriesNames[sIdx] = name;
        setElement(selectedEl.id, (el) => ({ ...el, seriesNames: newSeriesNames }));
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
                onChange={(value) => setElement(selectedEl.id, (el) => {
                    const newEl = { ...el, chartType: value };
                    if (value === "groupedBar") {
                        newEl.seriesNames = el.seriesNames || ["Seri 1", "Seri 2"];
                        newEl.data = (el.data || []).map((item) => {
                            if (Array.isArray(item.values) && item.values.length > 0) return item;
                            const val = parseFloat(item.value) || 0;
                            return { ...item, values: [val, Math.round(val * 0.7)] };
                        });
                    } else if (el.chartType === "groupedBar") {
                        newEl.data = (el.data || []).map((item) => {
                            if (item.value !== undefined) return item;
                            const firstVal = Array.isArray(item.values) ? item.values[0] : 0;
                            return { ...item, value: parseFloat(firstVal) || 0 };
                        });
                    }
                    if (value === "pie") {
                        const size = Math.min(el.width || 200, el.height || 180);
                        newEl.width = size;
                        newEl.height = size;
                    } else if (el.chartType === "pie" && (value === "bar" || value === "line" || value === "groupedBar")) {
                        newEl.height = Math.round(el.width * 0.75);
                    }
                    return newEl;
                })}
                options={[
                    { value: "bar", label: "Grafik Batang (Bar)" },
                    { value: "groupedBar", label: "Grafik Batang Terkelompok (Grouped Bar)" },
                    { value: "line", label: "Grafik Garis (Line)" },
                    { value: "pie", label: "Grafik Lingkaran (Pie)" },
                ]}
            />

            {/* Styling */}
            <p className={styles.sectionTitle}>Tampilan Grafik</p>
            <div className={styles.row} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className={styles.label}>Tampilkan Label</span>
                <Switch
                    checked={selectedEl.showLabels !== false}
                    onChange={(checked) => setElement(selectedEl.id, (el) => ({ ...el, showLabels: checked }))}
                />
            </div>
            <div className={styles.row} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className={styles.label}>Tampilkan Nilai</span>
                <Switch
                    checked={selectedEl.showValues !== false}
                    onChange={(checked) => setElement(selectedEl.id, (el) => ({ ...el, showValues: checked }))}
                />
            </div>
            {selectedEl.chartType !== "pie" && (
                <div className={styles.row} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span className={styles.label}>Tampilkan Sumbu (Line XY)</span>
                    <Switch
                        checked={selectedEl.showAxes !== false}
                        onChange={(checked) => setElement(selectedEl.id, (el) => ({ ...el, showAxes: checked }))}
                    />
                </div>
            )}

            {/* Grouped Bar Series Manager */}
            {isGrouped && (
                <>
                    <p className={styles.sectionTitle} style={{ marginTop: 12 }}>Seri Grafik (Grouped Series)</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                        {seriesNames.map((sName, sIdx) => (
                            <div key={`series-${sIdx}`} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", minWidth: 45 }}>Seri {sIdx + 1}:</span>
                                <input
                                    type="text"
                                    value={sName}
                                    onChange={(e) => handleSeriesNameChange(sIdx, e.target.value)}
                                    placeholder="Nama Seri"
                                    style={{
                                        flex: 1,
                                        background: "rgba(255,255,255,0.03)",
                                        
                                        color: "#fff",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        fontSize: 12
                                    }}
                                />
                                {seriesNames.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSeries(sIdx)}
                                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addSeries}
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                
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
                            <FaPlus size={10} /> Tambah Seri
                        </button>
                    </div>
                </>
            )}

            {/* Layout */}
            <p className={styles.sectionTitle}>Tata Letak & Jarak</p>
            <div className={styles.row} style={{ marginBottom: 12 }}>
                <span className={styles.label}>Padding Sisi (px)</span>
                <InputNumber
                    min={0}
                    max={100}
                    value={selectedEl.chartPadding !== undefined ? selectedEl.chartPadding : 25}
                    onChange={(val) => setElement(selectedEl.id, (el) => ({ ...el, chartPadding: val }))}
                />
            </div>
            <div className={styles.row} style={{ marginBottom: 12 }}>
                <span className={styles.label}>Jarak Label ke Chart (px)</span>
                <InputNumber
                    min={0}
                    max={100}
                    value={selectedEl.labelGap !== undefined ? selectedEl.labelGap : 4}
                    onChange={(val) => setElement(selectedEl.id, (el) => ({ ...el, labelGap: val }))}
                />
            </div>
            <div className={styles.row} style={{ marginBottom: 12 }}>
                <span className={styles.label}>Jarak Legend (px)</span>
                <InputNumber
                    min={0}
                    max={200}
                    value={selectedEl.legendGap !== undefined ? selectedEl.legendGap : 16}
                    onChange={(val) => setElement(selectedEl.id, (el) => ({ ...el, legendGap: val }))}
                />
            </div>

            {/* Typography */}
            <p className={styles.sectionTitle}>Gaya Teks</p>
            <div className={styles.row}>
                <span className={styles.label}>Ukuran Font (Label)</span>
                <InputNumber
                    min={4}
                    max={100}
                    value={selectedEl.fontSize}
                    onChange={(val) => setElement(selectedEl.id, (el) => ({ ...el, fontSize: val }))}
                />
            </div>
            <div className={styles.row}>
                <span className={styles.label}>Ukuran Font (Nilai)</span>
                <InputNumber
                    min={4}
                    max={100}
                    value={selectedEl.valueFontSize !== undefined ? selectedEl.valueFontSize : selectedEl.fontSize}
                    onChange={(val) => setElement(selectedEl.id, (el) => ({ ...el, valueFontSize: val }))}
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
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                            {isGrouped ? `Warna Seri ${idx + 1}` : `Warna ${idx + 1}`}
                        </span>
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
                {data.map((item, idx) => {
                    const itemValues = Array.isArray(item.values)
                        ? item.values
                        : [item.value !== undefined ? item.value : 0];

                    return (
                        <div key={`data-item-${idx}`} style={{ display: "flex", flexDirection: "column", gap: 4, background: "rgba(255,255,255,0.02)", padding: 6, borderRadius: 4,  }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input
                                    type="text"
                                    value={item.label}
                                    onChange={(e) => handleDataChange(idx, "label", e.target.value)}
                                    placeholder="Label Kategori"
                                    style={{
                                        flex: 1,
                                        background: "rgba(255,255,255,0.03)",
                                        
                                        color: "#fff",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        fontSize: 12
                                    }}
                                />
                                {!isGrouped && (
                                    <input
                                        type="number"
                                        value={item.value}
                                        onChange={(e) => handleDataChange(idx, "value", parseFloat(e.target.value) || 0)}
                                        placeholder="Nilai"
                                        style={{
                                            width: 65,
                                            background: "rgba(255,255,255,0.03)",
                                            
                                            color: "#fff",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: 12
                                        }}
                                    />
                                )}
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

                            {/* Multi-series input values for Grouped Bar */}
                            {isGrouped && (
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                                    {seriesNames.map((sName, sIdx) => (
                                        <div key={`val-${idx}-${sIdx}`} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{sName}:</span>
                                            <input
                                                type="number"
                                                value={itemValues[sIdx] !== undefined ? itemValues[sIdx] : 0}
                                                onChange={(e) => handleGroupedValueChange(idx, sIdx, parseFloat(e.target.value) || 0)}
                                                style={{
                                                    width: 55,
                                                    background: "rgba(255,255,255,0.03)",
                                                    
                                                    color: "#fff",
                                                    padding: "3px 6px",
                                                    borderRadius: "4px",
                                                    fontSize: 11
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
                <button
                    type="button"
                    onClick={addDataItem}
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        
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
