import React, { useState } from "react";
import { useSelector } from "react-redux";
import styles from './EditorColorPicker.module.css';

export default function EditorColorPicker({ setPagesWithHistory }) {
    const { activeIndex, selectedUniqueId } = useSelector((state) => state?.editor ?? {});
    const [color, setColor] = useState("#000000");
    const [showPicker, setShowPicker] = useState(false);

    const handleColorChange = (e) => {
        const newColor = e.target.value;
        setColor(newColor);

        setPagesWithHistory((prev) => {
            const cp = JSON.parse(JSON.stringify(prev));

            if (selectedUniqueId) {
                const selectedIds = Array.isArray(selectedUniqueId) ? selectedUniqueId : [selectedUniqueId];
                cp[activeIndex].children = cp[activeIndex]?.children?.map((c) => {
                    if (selectedIds.includes(c?.id)) {
                        if (c?.type === "text") return { ...c, fill: newColor };
                        if (c?.type === "icon") return { ...c, fill: newColor };
                        if (c?.type === "line") return { ...c, stroke: newColor };
                        return { ...c, fill: newColor };
                    }
                    return c;
                });
            } else {
                cp[activeIndex] = {
                    ...(cp[activeIndex] || {}),
                    background: newColor,
                    children: cp[activeIndex]?.children || [],
                };
            }
            return cp;
        });
    };

    React.useEffect(() => {
        setPagesWithHistory((prev) => {
            if (!prev[activeIndex]) return prev;
            if (selectedUniqueId) {
                const selectedIds = Array.isArray(selectedUniqueId) ? selectedUniqueId : [selectedUniqueId];
                const primaryId = selectedIds[selectedIds.length - 1];
                const obj = prev[activeIndex]?.children?.find(c => c?.id === primaryId);
                if (obj) {
                    if (obj?.type === "line") setColor(obj?.stroke || "#000000");
                    else setColor(obj?.fill || "#000000");
                }
            } else {
                setColor(prev[activeIndex]?.background || "#ffffff");
            }
            return prev;
        });
    }, [selectedUniqueId, activeIndex]);

    return (
        <div className={styles.wrapper} title="Color">
            <label className={styles.swatch} style={{ background: color }}>
                <input
                    type="color"
                    value={color}
                    onChange={handleColorChange}
                    className={styles.colorInput}
                />
            </label>
        </div>
    );
}