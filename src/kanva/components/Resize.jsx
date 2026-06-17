import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InputNumber, Switch, Button, Typography } from "./UIControls";

import { setCanvasSize, setEditorPages } from "../store/editorReducer";
import { FaInstagram } from "react-icons/fa6";
import { LiaFacebookSquare } from "react-icons/lia";
import { CiYoutube, CiLinkedin, CiTwitter } from "react-icons/ci";
import { TbFileText } from "react-icons/tb";

import styles from "./Resize.module.css";

const { Text } = Typography;

// Ukuran kertas dalam px pada 96 DPI
// A4:  210mm × 297mm  → 794 × 1123 px
// A3:  297mm × 420mm  → 1123 × 1587 px
// F4:  215mm × 330mm  → 813 × 1247 px

const PRESETS = {
    "Kertas": [
        { name: "A4 Portrait",   w: 794,  h: 1123 },
        { name: "A4 Landscape",  w: 1123, h: 794  },
        { name: "A3 Portrait",   w: 1123, h: 1587 },
        { name: "A3 Landscape",  w: 1587, h: 1123 },
        { name: "F4 Portrait",   w: 813,  h: 1247 },
        { name: "F4 Landscape",  w: 1247, h: 813  },
    ],

    YouTube: [
        { name: "Channel Art",     w: 2560, h: 1440 },
        { name: "Thumbnail",       w: 1280, h: 720  },
        { name: "Shorts / Vertical", w: 1080, h: 1920 },
    ],

    Instagram: [
        { name: "Post (Square)",         w: 1080, h: 1080 },
        { name: "Post (Portrait 4:5)",   w: 1080, h: 1350 },
        { name: "Post (Landscape 1.91:1)", w: 1080, h: 566 },
        { name: "Story / Reel",          w: 1080, h: 1920 },
    ],

    Facebook: [
        { name: "Cover (Desktop)",   w: 820,  h: 312  },
        { name: "Cover (Classic)",   w: 851,  h: 315  },
        { name: "Event Cover (Std)", w: 1200, h: 628  },
        { name: "Event Cover (Hi)",  w: 1920, h: 1005 },
        { name: "Post (Landscape)",  w: 1200, h: 630  },
        { name: "Post (Square)",     w: 1080, h: 1080 },
        { name: "Story",             w: 1080, h: 1920 },
        { name: "Profile Picture",   w: 400,  h: 400  },
    ],

    LinkedIn: [
        { name: "Personal Banner",     w: 1584, h: 396 },
        { name: "Company Banner",      w: 1536, h: 768 },
        { name: "Overview Tab Image",  w: 360,  h: 120 },
        { name: "Life Tab Hero",       w: 1128, h: 376 },
        { name: "Post (with Link)",    w: 1200, h: 627 },
        { name: "Profile Picture",     w: 400,  h: 400 },
    ],

    Twitter: [
        { name: "Header",              w: 1500, h: 500  },
        { name: "Post (16:9)",         w: 1200, h: 675  },
        { name: "Post (Square)",       w: 1080, h: 1080 },
        { name: "Profile Picture",     w: 400,  h: 400  },
    ],
};

const PlatformIcon = ({ platform, size = 22 }) => {
    switch (platform) {
        case "Instagram": return <FaInstagram size={size} />;
        case "Facebook":  return <LiaFacebookSquare size={size + 3} />;
        case "YouTube":   return <CiYoutube size={size + 2} />;
        case "LinkedIn":  return <CiLinkedin size={size + 4} />;
        case "Twitter":   return <CiTwitter size={size + 3} />;
        case "Kertas":    return <TbFileText size={size} />;
        default:          return null;
    }
};

export default function Resize() {
    const dispatch = useDispatch();
    const { canvasSize, editorPages, activeIndex } = useSelector((state) => state?.editor ?? {});
    const [state, setState] = useState({ width: canvasSize?.w, height: canvasSize?.h, magicResize: true });

    const handleResize = () => {
        const oldW = canvasSize?.w;
        const oldH = canvasSize?.h;
        const scaleX = state?.width / oldW;
        const scaleY = state?.height / oldH;

        const updatedPages = editorPages?.map((page, idx) => {
            if (idx !== activeIndex) return page;
            return {
                ...page,
                children: page?.children?.map((el) => ({
                    ...el,
                    x: el?.x * scaleX,
                    y: el?.y * scaleY,
                    width:  el?.width  ? el?.width  * scaleX : el?.width,
                    height: el?.height ? el?.height * scaleY : el?.height,
                })),
            };
        });

        dispatch(setCanvasSize({ w: state?.width, h: state?.height }));
        dispatch(setEditorPages(updatedPages));
    };

    const applyPreset = (w, h) => {
        setState((prev) => ({ ...prev, width: w, height: h }));
        dispatch(setCanvasSize({ w, h }));
    };

    return (
        <div className={styles.container}>
            {/* Magic Resize toggle */}
            <div className={styles.controlRow}>
                <Text>Use magic resize</Text>
                <Switch
                    size="small"
                    checked={state?.magicResize}
                    onChange={(value) => setState((prev) => ({ ...prev, magicResize: value }))}
                />
            </div>

            {/* Width */}
            <div className={styles.controlRow}>
                <Text>Width</Text>
                <InputNumber
                    min={1}
                    value={state?.width}
                    onChange={(value) => setState((prev) => ({ ...prev, width: Number(value) || 1 }))}
                    style={{ width: "60%" }}
                />
            </div>

            {/* Height */}
            <div className={styles.controlRow}>
                <Text>Height</Text>
                <InputNumber
                    min={1}
                    value={state?.height}
                    onChange={(value) => setState((prev) => ({ ...prev, height: Number(value) || 1 }))}
                    style={{ width: "60%" }}
                />
            </div>

            <Button type="primary" block onClick={handleResize} className={styles.resizeBtn}>
                Resize
            </Button>

            <div className={styles.divider} />

            {/* Presets */}
            {Object.entries(PRESETS).map(([platform, sizes]) => (
                <div key={platform} className={styles.platformGroup}>
                    <div className={styles.platformTitle}>
                        <PlatformIcon platform={platform} size={14} />
                        {platform}
                    </div>
                    <div className={styles.presetGrid}>
                        {sizes.map((preset, index) => (
                            <div
                                key={preset.name + index}
                                className={styles.presetCard}
                                onClick={() => applyPreset(preset.w, preset.h)}
                            >
                                <span className={styles.presetIcon}>
                                    <PlatformIcon platform={platform} size={18} />
                                </span>
                                <span className={styles.presetName}>{preset.name}</span>
                                <span className={styles.presetSize}>{preset.w} × {preset.h}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
