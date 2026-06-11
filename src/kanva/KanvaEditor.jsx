import { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    setCollapsed,
    setEditorPages,
    setPopUp,
    setSaveTemplate,
    setSelectedUniqueId,
    setZoom,
    setPath
} from './store/editorReducer';

import { IoDuplicateOutline, IoSaveOutline, IoArrowBack } from "react-icons/io5";
import { HiOutlinePencil } from "react-icons/hi2";
import { RiDeleteBin5Line } from "react-icons/ri";
import { SlReload } from "react-icons/sl";
import { GoZoomIn, GoZoomOut } from "react-icons/go";

import { GrTemplate } from "react-icons/gr";
import { PiTextAaLight } from "react-icons/pi";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import { IoShapesOutline } from "react-icons/io5";
import { GrCloudUpload } from "react-icons/gr";
import { SlLayers } from "react-icons/sl";
import { PiResizeThin } from "react-icons/pi";

import EditorLayer from "./components/EditorLayer";
import Sidebar from "./components/Sidebar";
import Share from './components/Share';
import UndoRedo from './components/UndoRedo';
import AddPage from './components/AddPage';
import EditorColorPicker from './components/EditorColorPicker';

import styles from './KanvaEditor.module.css';

export default function KanvaEditor() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const tplId = searchParams.get("id");

    const {
        path,
        zoom,
        activeIndex,
        selectedUniqueId,
        editorPages,
        canvasSize,
        savedTemplates
    } = useSelector((state) => state?.editor ?? {});

    const stageRef = useRef(null);
    const containerRef = useRef(null);

    // undo/redo history
    const [pushHistory, setPushHistory] = useState(editorPages);

    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

    const activePage = editorPages[activeIndex] || { children: [], background: "#ffffff" };
    const selectedEl = (activePage?.children || [])?.find((e) => e?.id === selectedUniqueId);

    // pen/draw tool state
    const [isPenTool, setIsPenTool] = useState(false);
    const [lines, setLines] = useState([]);
    const isDrawing = useRef(false);

    const [penColor, setPenColor] = useState("#000000");
    const [penSize, setPenSize] = useState(3);
    const [penOpacity, setPenOpacity] = useState(1);
    const [lineCap, setLineCap] = useState("round");
    const [showPenDropdown, setShowPenDropdown] = useState(false);

    // Load templates if ID provided
    useEffect(() => {
        if (tplId && savedTemplates) {
            const tpl = savedTemplates?.find((t) => String(t?.id) === tplId);
            if (tpl) dispatch(setEditorPages(tpl?.pages));
        }
    }, [tplId, savedTemplates, dispatch]);

    // Handle stage resizing on window change
    useEffect(() => {
        if (stageRef?.current) {
            stageRef?.current?.width(canvasSize?.w);
            stageRef?.current?.height(canvasSize?.h);
            stageRef?.current?.batchDraw();
        }
    }, [canvasSize]);

    // ResizeObserver for canvas wrapper
    useEffect(() => {
        if (!containerRef?.current) return;

        const resizeObserver = new ResizeObserver(() => {
            setContainerSize({
                w: containerRef?.current?.offsetWidth || 0,
                h: containerRef?.current?.offsetHeight || 0,
            });
        });

        resizeObserver?.observe(containerRef?.current);
        return () => resizeObserver?.disconnect();
    }, []);

    // Autofit zoom on first load or size changes
    useEffect(() => {
        if (!canvasSize?.w || !canvasSize?.h || !containerSize?.w || !containerSize?.h) return;

        const scaleX = containerSize?.w / canvasSize?.w;
        const scaleY = containerSize?.h / canvasSize?.h;

        const newZoom = Math.min(scaleX, scaleY) * 0.9; // 10% padding
        dispatch(setZoom(newZoom));
    }, [canvasSize, containerSize, dispatch]);

    // Pen drawings logic
    const handleMouseDown = useCallback((e) => {
        if (!isPenTool) return;
        isDrawing.current = true;
        const pos = e.target.getStage().getRelativePointerPosition();
        setLines((prev) => [
            ...prev,
            {
                points: [pos?.x, pos?.y],
                color: penColor,
                size: penSize,
                opacity: penOpacity,
                cap: lineCap,
            },
        ]);
    }, [isPenTool, penColor, penSize, penOpacity, lineCap]);

    const handleMouseMove = useCallback((e) => {
        if (!isDrawing.current || !isPenTool) return;
        const stage = e?.target.getStage();
        const point = stage.getRelativePointerPosition();
        setLines((prev) => {
            const lastLine = prev[prev?.length - 1];
            if (!lastLine) return prev;
            const newLines = prev?.slice();
            lastLine.points = lastLine?.points?.concat([point?.x, point?.y]);
            newLines.splice(prev.length - 1, 1, lastLine);
            return newLines;
        });
    }, [isPenTool]);

    const handleMouseUp = useCallback(() => {
        if (!isPenTool) return;
        isDrawing.current = false;
    }, [isPenTool]);

    const clearAnnotations = () => setLines([]);

    const setPagesWithHistory = (updaterOrPages) => {
        const next = typeof updaterOrPages === "function" ? updaterOrPages(editorPages) : updaterOrPages;
        setTimeout(() => setPushHistory(next), 0);
        dispatch(setEditorPages(next));
    };

    const setElement = (id, updater) => {
        setPagesWithHistory((prev) => {
            const cp = JSON.parse(JSON.stringify(prev));
            const els = (cp[activeIndex]?.children || [])?.map((el) => (el && el?.id === id ? updater(el) : el));
            cp[activeIndex] = { ...cp[activeIndex], children: els };
            return cp;
        });
    };

    const openMiniFor = (id) => {
        dispatch(setSelectedUniqueId(id));
        const el = (activePage?.children || [])?.find((e) => e?.id === id);
        if (el?.type === "text") dispatch(setPopUp(true));
        else dispatch(setPopUp(false));
    };

    const deleteSelected = () => {
        if (!selectedUniqueId) return;
        setPagesWithHistory((prev) => {
            const cp = JSON.parse(JSON.stringify(prev));
            const page = cp[activeIndex] || { children: [] };
            page.children = (page?.children || [])?.filter((el) => el?.id !== selectedUniqueId);
            cp[activeIndex] = page;
            return cp;
        });
        dispatch(setSelectedUniqueId(null));
        dispatch(setPopUp(false));
    };

    const duplicateSelected = () => {
        if (!selectedUniqueId) return;
        const el = (activePage?.children || [])?.find((e) => e?.id === selectedUniqueId);
        if (!el) return;
        const id = `${el?.id}-copy-${Date.now()}`;
        const copy = { ...el, id, x: (el?.x || 0) + 20, y: (el?.y || 0) + 20 };
        setPagesWithHistory((prev) => {
            const cp = JSON.parse(JSON.stringify(prev));
            const page = cp[activeIndex] || { children: [] };
            page.children = page?.children || [];
            page?.children?.push(copy);
            cp[activeIndex] = page;
            return cp;
        });
        openMiniFor(id);
    };

    const handleNavClick = (panelName) => {
        dispatch(setSelectedUniqueId(null));
        dispatch(setPopUp(false));
        dispatch(setPath(panelName));
    };

    const saveTemplate = () => {
        if (stageRef.current) {
            const preview = stageRef.current.toDataURL({ pixelRatio: 0.3 }); // small thumbnail
            dispatch(
                setSaveTemplate({
                    id: Date.now(),
                    pages: editorPages,
                    preview,
                })
            );
        }
        navigate('/dashboard/infografis/histori');
    };

    const sidebarTabs = [
        { name: "banner", label: "Template", icon: <GrTemplate /> },
        { name: "text", label: "Teks", icon: <PiTextAaLight /> },
        { name: "photo", label: "Foto", icon: <MdOutlinePhotoSizeSelectActual /> },
        { name: "element", label: "Elemen", icon: <IoShapesOutline /> },
        { name: "shape", label: "Bentuk", icon: <IoShapesOutline /> },
        { name: "upload", label: "Unggah", icon: <GrCloudUpload /> },
        { name: "layer", label: "Layer", icon: <SlLayers /> },
        { name: "resize", label: "Ukuran", icon: <PiResizeThin /> },
    ];

    return (
        <div className={styles.editorLayout}>
            {/* Top Toolbar */}
            <div className={styles.topBar}>
                <div className={styles.topLeft}>
                    <button
                        className={styles.backBtn}
                        onClick={() => navigate('/dashboard/infografis/histori')}
                    >
                        <IoArrowBack size={18} />
                        <span>Kembali</span>
                    </button>
                    <span className={styles.logo}>KANVA</span>
                </div>

                <div className={styles.toolbar}>
                    <div className={styles.toolbarGroup}>
                        <UndoRedo pushHistory={pushHistory} />
                    </div>

                    <div className={styles.toolbarGroup}>
                        <EditorColorPicker setPagesWithHistory={setPagesWithHistory} />
                    </div>

                    <div className={styles.toolbarGroup}>
                        {/* Duplicate */}
                        <button
                            className={styles.toolBtn}
                            onClick={duplicateSelected}
                            disabled={!selectedUniqueId}
                            title="Duplikat Elemen"
                        >
                            <IoDuplicateOutline size={18} />
                        </button>

                        {/* Delete */}
                        <button
                            className={styles.toolBtn}
                            onClick={deleteSelected}
                            disabled={!selectedUniqueId}
                            style={{ color: selectedUniqueId ? '#ef4444' : 'rgba(255, 255, 255, 0.3)' }}
                            title="Hapus Elemen"
                        >
                            <RiDeleteBin5Line size={18} />
                        </button>
                    </div>

                    {/* Zoom controls */}
                    <div className={styles.toolbarGroup}>
                        <button
                            className={styles.toolBtn}
                            onClick={() => dispatch(setZoom(Math.max(0.2, zoom - 0.1)))}
                            title="Perkecil"
                        >
                            <GoZoomOut size={16} />
                        </button>
                        <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
                        <button
                            className={styles.toolBtn}
                            onClick={() => dispatch(setZoom(Math.min(3, zoom + 0.1)))}
                            title="Perbesar"
                        >
                            <GoZoomIn size={16} />
                        </button>
                        <button
                            className={styles.toolBtn}
                            onClick={() => dispatch(setZoom(1))}
                            title="Reset Zoom"
                        >
                            <SlReload size={16} />
                        </button>
                    </div>

                    {/* Annotation / Pen Tool */}
                    <div className={styles.toolbarGroup} style={{ position: 'relative' }}>
                        <button
                            className={`${styles.toolBtn} ${isPenTool ? styles.toolBtnActive : ''}`}
                            onClick={() => {
                                setIsPenTool(!isPenTool);
                                if (!isPenTool) setShowPenDropdown(true);
                                else setShowPenDropdown(false);
                            }}
                            title="Alat Gambar (Pen)"
                        >
                            <HiOutlinePencil size={18} />
                        </button>

                        {isPenTool && showPenDropdown && (
                            <div className={styles.penControlsDropdown}>
                                <div className={styles.penControlRow}>
                                    <label>Warna</label>
                                    <input
                                        type="color"
                                        value={penColor}
                                        onChange={(e) => setPenColor(e.target.value)}
                                    />
                                </div>
                                <div className={styles.penControlRow}>
                                    <label>Ukuran ({penSize}px)</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        value={penSize}
                                        onChange={(e) => setPenSize(Number(e.target.value))}
                                        className={styles.penInputRange}
                                    />
                                </div>
                                <div className={styles.penControlRow}>
                                    <label>Opasitas ({Math.round(penOpacity * 100)}%)</label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1"
                                        step="0.1"
                                        value={penOpacity}
                                        onChange={(e) => setPenOpacity(Number(e.target.value))}
                                        className={styles.penInputRange}
                                    />
                                </div>
                                <div className={styles.penControlRow} style={{ gap: 4, marginTop: 4 }}>
                                    <button
                                        className={`${styles.backBtn} ${lineCap === 'round' ? styles.toolBtnActive : ''}`}
                                        style={{ padding: '2px 8px', fontSize: 11 }}
                                        onClick={() => setLineCap("round")}
                                    >
                                        Bulat
                                    </button>
                                    <button
                                        className={`${styles.backBtn} ${lineCap === 'square' ? styles.toolBtnActive : ''}`}
                                        style={{ padding: '2px 8px', fontSize: 11 }}
                                        onClick={() => setLineCap("square")}
                                    >
                                        Kotak
                                    </button>
                                </div>
                                <button
                                    className={styles.backBtn}
                                    style={{ width: '100%', padding: '4px', fontSize: 12, color: '#ef4444', borderColor: '#ef4444' }}
                                    onClick={clearAnnotations}
                                >
                                    Hapus Coretan
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.toolbarGroup}>
                        <Share stageRef={stageRef} />
                    </div>

                    <button
                        className={styles.backBtn}
                        style={{ background: '#34B34A', borderColor: '#2da140', color: '#fff', fontWeight: 600 }}
                        onClick={saveTemplate}
                    >
                        <IoSaveOutline size={16} />
                        <span>Simpan</span>
                    </button>
                </div>
            </div>

            {/* Main Editor Grid */}
            <div className={styles.mainArea}>
                {/* Left Side Icons Panel */}
                <div className={styles.navBar}>
                    {sidebarTabs.map((tab) => {
                        const isActive = path === tab.name;
                        return (
                            <div
                                key={tab.name}
                                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                                onClick={() => handleNavClick(tab.name)}
                            >
                                <span className={styles.navItemIcon}>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Sub Panel Content Sidebar */}
                <div className={styles.sidebarContainer}>
                    <Sidebar
                        selectedEl={selectedEl}
                        setElement={setElement}
                        activePage={activePage}
                        setPagesWithHistory={setPagesWithHistory}
                        openMiniFor={openMiniFor}
                        stageRef={stageRef}
                    />
                </div>

                {/* Canvas Area */}
                <div className={styles.canvasArea}>
                    <div ref={containerRef} className={styles.stageViewport}>
                        <Stage
                            ref={stageRef}
                            key={`${canvasSize?.w}x${canvasSize?.h}`}
                            width={canvasSize?.w}
                            height={canvasSize?.h}
                            scale={{ x: zoom, y: zoom }}
                            x={(containerSize?.w - canvasSize?.w * zoom) / 2}
                            y={(containerSize?.h - canvasSize?.h * zoom) / 2}
                            style={{
                                background: activePage?.background || "#ffffff",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                            }}
                            onMouseDown={(e) => {
                                if (e.target === e.target.getStage()) {
                                    dispatch(setSelectedUniqueId(null));
                                    dispatch(setPopUp(false));
                                }
                                handleMouseDown(e);
                            }}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                        >
                            <Layer>
                                {(activePage?.children || []).map((el) => {
                                    if (!el) return null;
                                    let element = { ...el };

                                    if (isPenTool) {
                                        element['locked'] = true;
                                    } else {
                                        element['locked'] = el?.locked || false;
                                    }

                                    return (
                                        <EditorLayer
                                            key={element.id}
                                            el={element}
                                            setElement={setElement}
                                            stageRef={stageRef}
                                        />
                                    );
                                })}
                                {lines?.map((line, i) => (
                                    <Line
                                        key={i}
                                        points={line?.points}
                                        stroke={line?.color}
                                        strokeWidth={line?.size}
                                        opacity={line?.opacity}
                                        tension={0.5}
                                        lineCap={line?.cap}
                                        lineJoin="round"
                                    />
                                ))}
                            </Layer>
                        </Stage>
                    </div>

                    {/* Bottom Page Bar */}
                    <div className={styles.footerBar}>
                        <AddPage setPagesWithHistory={setPagesWithHistory} />
                    </div>
                </div>
            </div>
        </div>
    );
}
