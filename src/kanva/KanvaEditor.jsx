import { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import {
    setEditorPages,
    setPopUp,
    setSaveTemplate,
    updateTemplate,
    setSelectedUniqueId,
    setZoom,
    setPath,
    setCanvasSize
} from './store/editorReducer';

import { IoDuplicateOutline, IoSaveOutline } from "react-icons/io5";
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

import EditorColorPicker from './components/EditorColorPicker';
import Wrapper from '../components/Wrapper/Wrapper';

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
    const selectedEl = (activePage?.children || [])?.find((e) => {
        const selectedIds = Array.isArray(selectedUniqueId) ? selectedUniqueId : [selectedUniqueId].filter(Boolean);
        const primaryId = selectedIds[selectedIds.length - 1];
        return e?.id === primaryId;
    });

    // pen/draw tool state
    const [isPenTool, setIsPenTool] = useState(false);
    const [lines, setLines] = useState([]);
    const isDrawing = useRef(false);

    const [penColor, setPenColor] = useState("#000000");
    const [penSize, setPenSize] = useState(3);
    const [penOpacity, setPenOpacity] = useState(1);
    const [lineCap, setLineCap] = useState("round");
    const [showPenDropdown, setShowPenDropdown] = useState(false);

    // Zoom/Pan states
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [isAltPressed, setIsAltPressed] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);

    const stagePosRef = useRef(stagePos);
    stagePosRef.current = stagePos;

    const isAltPressedRef = useRef(isAltPressed);
    isAltPressedRef.current = isAltPressed;

    const zoomRef = useRef(zoom);
    zoomRef.current = zoom;

    // Clipboard state for copy/paste
    const [clipboard, setClipboard] = useState(null);

    // Ref to store original positions of selected items during a drag session
    const dragStartPositionsRef = useRef(null);

    const copySelected = () => {
        if (!selectedUniqueId) return;
        const selectedIds = Array.isArray(selectedUniqueId) ? selectedUniqueId : [selectedUniqueId];
        const elements = (activePage?.children || [])?.filter((e) => selectedIds.includes(e?.id));
        if (elements.length > 0) {
            setClipboard(elements);
        }
    };

    const pasteSelected = () => {
        if (!clipboard) return;

        const clipboardArr = Array.isArray(clipboard) ? clipboard : [clipboard];
        const newIds = [];
        const elementsToPaste = [];

        const assignNewIds = (element) => {
            const newEl = JSON.parse(JSON.stringify(element));
            newEl.id = `${newEl.id}-copy-${Date.now()}`;
            newEl.x = (newEl.x || 0) + 20;
            newEl.y = (newEl.y || 0) + 20;
            if (newEl.children && Array.isArray(newEl.children)) {
                newEl.children = newEl.children.map(child => {
                    const newChild = { ...child, id: `${child.id}-copy-${Date.now()}` };
                    return assignNewIds(newChild);
                });
            }
            return newEl;
        };

        clipboardArr.forEach(el => {
            const pasted = assignNewIds(el);
            elementsToPaste.push(pasted);
            newIds.push(pasted.id);
        });

        setPagesWithHistory((prev) => {
            const cp = JSON.parse(JSON.stringify(prev));
            const page = cp[activeIndex] || { children: [] };
            page.children = page.children || [];
            page.children.push(...elementsToPaste);
            cp[activeIndex] = page;
            return cp;
        });

        setClipboard(clipboardArr);
        if (newIds.length === 1) {
            openMiniFor(newIds[0]);
        } else {
            dispatch(setSelectedUniqueId(newIds));
        }
    };

    const selectAll = () => {
        const childrenIds = (activePage?.children || [])
            ?.filter(e => e && e.type !== 'banner')
            ?.map(e => e.id) || [];
        if (childrenIds.length > 0) {
            dispatch(setSelectedUniqueId(childrenIds));
        }
    };

    // Refs to expose latest functions in keydown event listener without stale closures
    const copySelectedRef = useRef(copySelected);
    copySelectedRef.current = copySelected;

    const pasteSelectedRef = useRef(pasteSelected);
    pasteSelectedRef.current = pasteSelected;

    const selectAllRef = useRef(selectAll);
    selectAllRef.current = selectAll;

    const duplicateSelectedRef = useRef(null);
    const deleteSelectedRef = useRef(null);

    const [saving, setSaving] = useState(false);

    // Load template if ID provided
    useEffect(() => {
        const loadProject = async () => {
            if (!tplId) return;
            try {
                const token = localStorage.getItem("token");
                const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";
                const response = await axios.get(`${serverUrl}/api/users/infografis/${tplId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const project = response.data;
                if (project) {
                    if (project.pages) {
                        dispatch(setEditorPages(project.pages));
                    }
                    if (project.canvasSize) {
                        dispatch(setCanvasSize(project.canvasSize));
                    }
                }
            } catch (err) {
                console.error("Gagal memuat infografis dari database:", err);
            }
        };
        loadProject();
    }, [tplId, dispatch]);

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

    // Autofit zoom on first load or size changes (sets initial zoom & stage center)
    useEffect(() => {
        if (!canvasSize?.w || !canvasSize?.h || !containerSize?.w || !containerSize?.h) return;

        const scaleX = containerSize?.w / canvasSize?.w;
        const scaleY = containerSize?.h / canvasSize?.h;

        const newZoom = Math.min(scaleX, scaleY) * 0.9; // 10% padding
        dispatch(setZoom(newZoom));
        setStagePos({
            x: (containerSize.w - canvasSize.w * newZoom) / 2,
            y: (containerSize.h - canvasSize.h * newZoom) / 2
        });
    }, [canvasSize, containerSize, dispatch]);

    // Global keyboard and window mouseup listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && (
                activeEl.tagName === "INPUT" ||
                activeEl.tagName === "TEXTAREA" ||
                activeEl.isContentEditable
            );

            if (e.code === "Space") {
                if (isTyping) return;
                e.preventDefault();
                setIsSpacePressed(true);
            }
            if (e.key === "Alt") {
                setIsAltPressed(true);
            }

            if (!isTyping) {
                const isCtrlOrCmd = e.ctrlKey || e.metaKey;
                const keyLower = e.key.toLowerCase();

                // Ctrl/Cmd + C (Copy)
                if (isCtrlOrCmd && keyLower === "c") {
                    e.preventDefault();
                    if (copySelectedRef.current) copySelectedRef.current();
                }

                // Ctrl/Cmd + V (Paste)
                if (isCtrlOrCmd && keyLower === "v") {
                    e.preventDefault();
                    if (pasteSelectedRef.current) pasteSelectedRef.current();
                }

                // Ctrl/Cmd + D (Duplicate)
                if (isCtrlOrCmd && keyLower === "d") {
                    e.preventDefault();
                    if (duplicateSelectedRef.current) duplicateSelectedRef.current();
                }

                // Ctrl/Cmd + A (Select All)
                if (isCtrlOrCmd && keyLower === "a") {
                    e.preventDefault();
                    if (selectAllRef.current) selectAllRef.current();
                }

                // Delete / Backspace (Delete selected element)
                if (e.key === "Delete" || e.key === "Backspace") {
                    e.preventDefault();
                    if (deleteSelectedRef.current) deleteSelectedRef.current();
                }
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === "Space") {
                setIsSpacePressed(false);
            }
            if (e.key === "Alt") {
                setIsAltPressed(false);
            }
        };

        const handleBlur = () => {
            setIsSpacePressed(false);
            setIsAltPressed(false);
            setIsMouseDown(false);
        };

        const handleWindowMouseUp = () => {
            setIsMouseDown(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleBlur);
        window.addEventListener("mouseup", handleWindowMouseUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("mouseup", handleWindowMouseUp);
        };
    }, []);

    // Set up native wheel event listener on stage container for non-passive prevention
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        const container = stage.container();

        const handleWheelRaw = (e) => {
            e.preventDefault();

            const oldScale = zoomRef.current;
            const rect = container.getBoundingClientRect();
            const pointer = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };

            const currentStagePos = stagePosRef.current;
            const currentIsAltPressed = isAltPressedRef.current;

            if (e.ctrlKey || e.altKey || currentIsAltPressed) {
                const scaleBy = 1.05;
                const mousePointTo = {
                    x: (pointer.x - currentStagePos.x) / oldScale,
                    y: (pointer.y - currentStagePos.y) / oldScale,
                };

                let newScale;
                if (e.ctrlKey && !e.altKey) {
                    newScale = oldScale * Math.exp(-e.deltaY * 0.01);
                } else {
                    const direction = e.deltaY < 0 ? 1 : -1;
                    newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
                }

                const clampedScale = Math.min(3, Math.max(0.1, newScale));
                dispatch(setZoom(clampedScale));
                setStagePos({
                    x: pointer.x - mousePointTo.x * clampedScale,
                    y: pointer.y - mousePointTo.y * clampedScale,
                });
            } else {
                setStagePos((pos) => ({
                    x: pos.x - e.deltaX,
                    y: pos.y - e.deltaY,
                }));
            }
        };

        container.addEventListener('wheel', handleWheelRaw, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheelRaw);
        };
    }, [dispatch, canvasSize?.w, canvasSize?.h]);

    const zoomToCenter = (newZoom) => {
        if (!canvasSize?.w || !containerSize?.w) return;
        const oldScale = zoom;
        const clampedZoom = Math.min(3, Math.max(0.1, newZoom));

        const pointer = {
            x: containerSize.w / 2,
            y: containerSize.h / 2
        };

        const mousePointTo = {
            x: (pointer.x - stagePos.x) / oldScale,
            y: (pointer.y - stagePos.y) / oldScale,
        };

        dispatch(setZoom(clampedZoom));
        setStagePos({
            x: pointer.x - mousePointTo.x * clampedZoom,
            y: pointer.y - mousePointTo.y * clampedZoom,
        });
    };

    const resetZoom = () => {
        if (!canvasSize?.w || !canvasSize?.h || !containerSize?.w || !containerSize?.h) return;
        const scaleX = containerSize?.w / canvasSize?.w;
        const scaleY = containerSize?.h / canvasSize?.h;
        const fitZoom = Math.min(scaleX, scaleY) * 0.9;
        dispatch(setZoom(fitZoom));
        setStagePos({
            x: (containerSize.w - canvasSize.w * fitZoom) / 2,
            y: (containerSize.h - canvasSize.h * fitZoom) / 2
        });
    };

    const getCursorStyle = () => {
        if (isSpacePressed) {
            return isMouseDown ? 'grabbing' : 'grab';
        }
        if (isAltPressed) {
            return 'zoom-in';
        }
        if (isPenTool) {
            return 'crosshair';
        }
        return 'default';
    };

    const handleStageDrag = useCallback((e) => {
        if (e.target === e.target.getStage()) {
            setStagePos({
                x: e.target.x(),
                y: e.target.y()
            });
        }
    }, []);

    const handleStageDragStart = useCallback((e) => {
        const target = e.target;
        if (target === target.getStage() || target.name() === 'page-background') return;

        const targetId = target.id();
        const selectedIds = Array.isArray(selectedUniqueId) ? selectedUniqueId : [selectedUniqueId].filter(Boolean);

        if (selectedIds.includes(targetId)) {
            const startPositions = {};
            selectedIds.forEach((id) => {
                const node = target.getStage().findOne('#' + id);
                if (node) {
                    startPositions[id] = { x: node.x(), y: node.y() };
                }
            });
            dragStartPositionsRef.current = startPositions;
        }
    }, [selectedUniqueId]);

    const handleStageDragMove = useCallback((e) => {
        if (e.target === e.target.getStage()) {
            handleStageDrag(e);
            return;
        }

        if (!dragStartPositionsRef.current) return;

        const target = e.target;
        const targetId = target.id();
        const startPositions = dragStartPositionsRef.current;
        const startTargetPos = startPositions[targetId];
        if (!startTargetPos) return;

        const dx = target.x() - startTargetPos.x;
        const dy = target.y() - startTargetPos.y;

        const selectedIds = Array.isArray(selectedUniqueId) ? selectedUniqueId : [selectedUniqueId].filter(Boolean);

        selectedIds.forEach((id) => {
            if (id !== targetId) {
                const node = target.getStage().findOne('#' + id);
                if (node) {
                    const start = startPositions[id];
                    if (start) {
                        node.position({
                            x: start.x + dx,
                            y: start.y + dy
                        });
                    }
                }
            }
        });
    }, [selectedUniqueId, handleStageDrag]);

    const handleStageDragEnd = useCallback((e) => {
        if (e.target === e.target.getStage()) {
            handleStageDrag(e);
            return;
        }
        dragStartPositionsRef.current = null;
    }, [handleStageDrag]);

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
            const activeChildren = cp[activeIndex]?.children || [];

            const originalEl = activeChildren.find((el) => el?.id === id);
            if (!originalEl) return prev;

            const updatedEl = updater(originalEl);

            const dx = (updatedEl.x ?? originalEl.x) - (originalEl.x ?? 0);
            const dy = (updatedEl.y ?? originalEl.y) - (originalEl.y ?? 0);

            const selectedIds = Array.isArray(selectedUniqueId) ? selectedUniqueId : [selectedUniqueId].filter(Boolean);
            const isDragging = dragStartPositionsRef.current !== null;

            const els = activeChildren.map((el) => {
                if (!el) return el;
                if (el.id === id) {
                    return updatedEl;
                }

                if (selectedIds.includes(el.id) && selectedIds.includes(id)) {
                    if (isDragging) {
                        const nextEl = { ...el };
                        if (dx !== 0 || dy !== 0) {
                            nextEl.x = (el.x || 0) + dx;
                            nextEl.y = (el.y || 0) + dy;
                        }
                        return nextEl;
                    }

                    const nextEl = { ...el };
                    for (const key in updatedEl) {
                        if (updatedEl[key] !== originalEl[key]) {
                            if (['id', 'x', 'y', 'width', 'height', 'rotation', 'points'].includes(key)) continue;
                            nextEl[key] = updatedEl[key];
                        }
                    }
                    return nextEl;
                }
                return el;
            });

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
        const selectedIds = Array.isArray(selectedUniqueId) ? selectedUniqueId : [selectedUniqueId];
        setPagesWithHistory((prev) => {
            const cp = JSON.parse(JSON.stringify(prev));
            const page = cp[activeIndex] || { children: [] };
            page.children = (page?.children || [])?.filter((el) => !selectedIds.includes(el?.id));
            cp[activeIndex] = page;
            return cp;
        });
        dispatch(setSelectedUniqueId(null));
        dispatch(setPopUp(false));
    };
    deleteSelectedRef.current = deleteSelected;

    const duplicateSelected = () => {
        if (!selectedUniqueId) return;
        const selectedIds = Array.isArray(selectedUniqueId) ? selectedUniqueId : [selectedUniqueId];
        const elements = (activePage?.children || [])?.filter((e) => selectedIds.includes(e?.id));
        if (elements.length === 0) return;

        const elementsToDuplicate = [];
        const newIds = [];

        const assignNewIds = (element) => {
            const newEl = JSON.parse(JSON.stringify(element));
            newEl.id = `${newEl.id}-copy-${Date.now()}`;
            newEl.x = (newEl.x || 0) + 20;
            newEl.y = (newEl.y || 0) + 20;
            if (newEl.children && Array.isArray(newEl.children)) {
                newEl.children = newEl.children.map(child => {
                    const newChild = { ...child, id: `${child.id}-copy-${Date.now()}` };
                    return assignNewIds(newChild);
                });
            }
            return newEl;
        };

        elements.forEach(el => {
            const duplicated = assignNewIds(el);
            elementsToDuplicate.push(duplicated);
            newIds.push(duplicated.id);
        });

        setPagesWithHistory((prev) => {
            const cp = JSON.parse(JSON.stringify(prev));
            const page = cp[activeIndex] || { children: [] };
            page.children = page?.children || [];
            page?.children?.push(...elementsToDuplicate);
            cp[activeIndex] = page;
            return cp;
        });

        if (newIds.length === 1) {
            openMiniFor(newIds[0]);
        } else {
            dispatch(setSelectedUniqueId(newIds));
        }
    };
    duplicateSelectedRef.current = duplicateSelected;

    const handleNavClick = (panelName) => {
        dispatch(setSelectedUniqueId(null));
        dispatch(setPopUp(false));
        if (path === panelName) {
            dispatch(setPath(undefined));
        } else {
            dispatch(setPath(panelName));
        }
    };

    const saveTemplate = async () => {
        if (saving) return;
        setSaving(true);

        const preview = stageRef.current?.toDataURL({
            x: stagePos.x,
            y: stagePos.y,
            width: canvasSize.w * zoom,
            height: canvasSize.h * zoom,
            pixelRatio: 0.3
        }) ?? null;

        const projectData = {
            pages: editorPages,
            preview,
            canvasSize,
        };

        try {
            const token = localStorage.getItem("token");
            const serverUrl = process.env.REACT_APP_URL_SERVER || "http://localhost:5000";

            if (tplId) {
                // Update project yang sudah ada (bukan buat baru)
                await axios.put(`${serverUrl}/api/users/infografis/${tplId}`, projectData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // Buat project baru
                await axios.post(`${serverUrl}/api/users/infografis`, projectData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            navigate('/dashboard/infografis/histori');
        } catch (err) {
            console.error("Gagal menyimpan infografis ke database:", err);
            alert("Gagal menyimpan infografis. Silakan coba lagi.");
        } finally {
            setSaving(false);
        }
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
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            {/* Top Toolbar - wrapped in Wrapper */}
            <div>
                <Wrapper width="100%" height="auto" padding="8px 20px" hoverable={false}>
                    <div className={styles.toolbar} style={{ width: '100%', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
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
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {/* Zoom controls */}
                            <div className={styles.toolbarGroup}>
                                <button
                                    className={styles.toolBtn}
                                    onClick={() => zoomToCenter(zoom - 0.1)}
                                    title="Perkecil"
                                >
                                    <GoZoomOut size={16} />
                                </button>
                                <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
                                <button
                                    className={styles.toolBtn}
                                    onClick={() => zoomToCenter(zoom + 0.1)}
                                    title="Perbesar"
                                >
                                    <GoZoomIn size={16} />
                                </button>
                                <button
                                    className={styles.toolBtn}
                                    onClick={resetZoom}
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
                                disabled={saving}
                            >
                                <IoSaveOutline size={16} />
                                <span>{saving ? "Menyimpan..." : "Simpan"}</span>
                            </button>
                        </div>
                    </div>
                </Wrapper>
            </div>

            {/* Left Nav Menu and Canvas split */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', height: 'calc(100vh - 200px)', position: 'relative' }}>
                {/* Left side Nav Menu Panel - wrapped in Wrapper */}
                <Wrapper width="auto" height="100%" padding="0" hoverable={false}>
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
                </Wrapper>

                {/* Sub Panel Content Sidebar - Absolute Overlay */}
                {(path !== undefined || selectedEl !== undefined) && (
                    <div
                        className={styles.sidebarContainer}
                        style={{
                            position: 'absolute',
                            left: '72px',
                            top: 0,
                            bottom: 0,
                            width: '340px',
                            zIndex: 50,
                            borderRadius: '8px',
                            boxShadow: '10px 0 30px rgba(0, 0, 0, 0.5)',
                            backgroundColor: 'rgba(255, 255, 255, 0.01)',
                            border: "solid rgba(255, 255, 255, 0.2) 1px"
                        }}
                    >
                        <Sidebar
                            selectedEl={selectedEl}
                            setElement={setElement}
                            activePage={activePage}
                            setPagesWithHistory={setPagesWithHistory}
                            openMiniFor={openMiniFor}
                            stageRef={stageRef}
                        />
                    </div>
                )}

                {/* Canvas Area Panel - wrapped in Wrapper */}
                <Wrapper width="100%" height="100%" padding="0" hoverable={false}>
                    <div className={styles.canvasArea} style={{ height: '100%' }}>
                        <div ref={containerRef} className={styles.stageViewport}>
                            <Stage
                                ref={stageRef}
                                key={`${canvasSize?.w}x${canvasSize?.h}`}
                                width={containerSize?.w}
                                height={containerSize?.h}
                                scale={{ x: zoom, y: zoom }}
                                x={stagePos.x}
                                y={stagePos.y}
                                draggable={isSpacePressed}
                                onDragStart={handleStageDragStart}
                                onDragMove={handleStageDragMove}
                                onDragEnd={handleStageDragEnd}
                                style={{
                                    cursor: getCursorStyle(),
                                }}
                                onMouseDown={(e) => {
                                    setIsMouseDown(true);
                                    if (!isSpacePressed && e.target === e.target.getStage()) {
                                        dispatch(setSelectedUniqueId(null));
                                        dispatch(setPopUp(false));
                                        dispatch(setPath(undefined));
                                    }
                                    handleMouseDown(e);
                                }}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                            >
                                <Layer>
                                    {/* Template Page Background with shadow */}
                                    <Rect
                                        name="page-background"
                                        x={0}
                                        y={0}
                                        width={canvasSize?.w}
                                        height={canvasSize?.h}
                                        fill={activePage?.background || "#ffffff"}
                                        shadowColor="rgba(0,0,0,0.3)"
                                        shadowBlur={20}
                                        shadowOffset={{ x: 0, y: 10 }}
                                        shadowOpacity={0.5}
                                        listening={true}
                                        onClick={(e) => {
                                            if (!isSpacePressed && e.target.name() === 'page-background') {
                                                dispatch(setSelectedUniqueId(null));
                                                dispatch(setPopUp(false));
                                                dispatch(setPath(undefined));
                                            }
                                        }}
                                        onTap={(e) => {
                                            if (!isSpacePressed && e.target.name() === 'page-background') {
                                                dispatch(setSelectedUniqueId(null));
                                                dispatch(setPopUp(false));
                                                dispatch(setPath(undefined));
                                            }
                                        }}
                                    />

                                    {(activePage?.children || []).map((el) => {
                                        if (!el) return null;
                                        let element = { ...el };

                                        if (isPenTool || isSpacePressed) {
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
                                                isSpacePressed={isSpacePressed}
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


                    </div>
                </Wrapper>
            </div>
        </div>
    );
}
