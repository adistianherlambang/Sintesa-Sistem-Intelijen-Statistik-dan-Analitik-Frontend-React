import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { TbTextSize } from "react-icons/tb";
import { HiOutlinePhoto } from "react-icons/hi2";
import { LiaShapesSolid } from "react-icons/lia";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { CiLock, CiUnlock } from "react-icons/ci";
import { BsArrowUp, BsArrowDown } from "react-icons/bs";

import { setSelectedUniqueId } from "../store/editorReducer";
import styles from "./Layer.module.css";

const getIcon = (type) => {
    switch (type) {
        case "text":
            return <TbTextSize size={18} />;
        case "image":
            return <HiOutlinePhoto size={18} />;
        case "svg":
            return <LiaShapesSolid size={20} />;
        default:
            return <LiaShapesSolid size={20} />;
    }
};

export default function Layer({ elements = [], onToggleLock, onToggleVisibility, onReorder }) {
    const dispatch = useDispatch();
    const { selectedUniqueId } = useSelector((state) => state?.editor ?? {});

    const moveLayer = (currentIndex, direction) => {
        const targetIndex = direction === "up" ? currentIndex + 1 : currentIndex - 1;
        if (targetIndex < 0 || targetIndex >= elements.length) return;

        const newElements = [...elements];
        const temp = newElements[currentIndex];
        newElements[currentIndex] = newElements[targetIndex];
        newElements[targetIndex] = temp;

        onReorder?.(newElements);
    };

    if (elements.length === 0) {
        return (
            <div className={styles.empty}>
                <LiaShapesSolid size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p>Belum ada layer</p>
            </div>
        );
    }

    // Render from top layer (end of array) to bottom layer (start of array)
    const reversedIndices = Array.from({ length: elements.length }, (_, i) => elements.length - 1 - i);

    return (
        <div className={styles.container}>
            {reversedIndices.map((origIndex) => {
                const el = elements[origIndex];
                if (!el) return null;
                const isSelected = selectedUniqueId === el.id;

                return (
                    <div
                        key={el.id}
                        className={`${styles.layerItem} ${isSelected ? styles.selected : ""}`}
                        onClick={() => dispatch(setSelectedUniqueId(el.id))}
                    >
                        <div className={styles.leftInfo}>
                            {getIcon(el.type)}
                            <span className={styles.layerName}>
                                {el.text?.slice(0, 16) || el.type || "Element"}
                            </span>
                        </div>
                        <div className={styles.actions}>
                            {/* Reorder Buttons */}
                            <button
                                className={styles.actionBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    moveLayer(origIndex, "up");
                                }}
                                disabled={origIndex === elements.length - 1}
                                title="Bawa ke depan"
                            >
                                <BsArrowUp size={14} />
                            </button>
                            <button
                                className={styles.actionBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    moveLayer(origIndex, "down");
                                }}
                                disabled={origIndex === 0}
                                title="Bawa ke belakang"
                            >
                                <BsArrowDown size={14} />
                            </button>

                            {/* Visibility Toggle */}
                            <button
                                className={styles.actionBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleVisibility?.(el.id);
                                }}
                                title={el.visible !== false ? "Sembunyikan" : "Tampilkan"}
                            >
                                {el.visible !== false ? (
                                    <IoEyeOutline size={16} />
                                ) : (
                                    <IoEyeOffOutline size={16} style={{ color: "#ef4444" }} />
                                )}
                            </button>

                            {/* Lock Toggle */}
                            <button
                                className={styles.actionBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleLock?.(el.id);
                                }}
                                title={el.locked ? "Buka Kunci" : "Kunci"}
                            >
                                {el.locked ? (
                                    <CiLock size={18} style={{ color: "#eab308" }} />
                                ) : (
                                    <CiUnlock size={18} />
                                )}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}