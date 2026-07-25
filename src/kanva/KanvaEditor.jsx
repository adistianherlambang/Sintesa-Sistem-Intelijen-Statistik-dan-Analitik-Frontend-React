import { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import {
    setEditorPages,
    setPopUp,
    setSelectedUniqueId,
    setZoom,
    setPath,
    setCanvasSize
} from './store/editorReducer';

import { IoDuplicateOutline, IoSaveOutline, IoBarChartOutline } from "react-icons/io5";
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
import SidebarLayer from "./components/Layer";
import sidebarStyles from "./components/Sidebar.module.css";

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
    const [isTextTool, setIsTextTool] = useState(false);
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

    // rAF Refs for smooth 60fps throttled zoom and pan updates
    const wheelRafRef = useRef(null);
    const pendingZoomRef = useRef(null);
    const pendingStagePosRef = useRef(null);

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

    function processSvg(svgString) {
        const trimmedText = svgString.trim();
        try {
            const base64Svg = window.btoa(unescape(encodeURIComponent(trimmedText)));
            const src = `data:image/svg+xml;base64,${base64Svg}`;
            
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
                let w = img.width || 300;
                let h = img.height || 300;
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(trimmedText, "image/svg+xml");
                const svgEl = doc.querySelector("svg");
                if (svgEl) {
                    const widthAttr = svgEl.getAttribute("width");
                    const heightAttr = svgEl.getAttribute("height");
                    const viewBoxAttr = svgEl.getAttribute("viewBox");
                    
                    if (widthAttr && heightAttr) {
                        w = parseFloat(widthAttr) || w;
                        h = parseFloat(heightAttr) || h;
                    } else if (viewBoxAttr) {
                        const parts = viewBoxAttr.split(/[\s,]+/);
                        if (parts.length === 4) {
                            const vbW = parseFloat(parts[2]);
                            const vbH = parseFloat(parts[3]);
                            if (vbW && vbH) {
                                const maxDim = 300;
                                const scale = maxDim / Math.max(vbW, vbH);
                                w = vbW * scale;
                                h = vbH * scale;
                            }
                        }
                    }
                }

                // Scale if too large
                const maxW = 400;
                const maxH = 400;
                if (w > maxW || h > maxH) {
                    const scale = Math.min(maxW / w, maxH / h);
                    w = w * scale;
                    h = h * scale;
                }

                addNewImageElement(src, canvasSize?.w / 2, canvasSize?.h / 2, w, h);
            };
        } catch (err) {
            console.error("Gagal memproses kode SVG yang di-paste:", err);
        }
    }

    async function pasteSelected() {
        let pastedExternal = false;
        
        if (navigator.clipboard && navigator.clipboard.read) {
            try {
                const items = await navigator.clipboard.read();
                for (const item of items) {
                    if (item.types.includes("image/svg+xml")) {
                        const blob = await item.getType("image/svg+xml");
                        const text = await blob.text();
                        processSvg(text);
                        pastedExternal = true;
                        break;
                    } else if (item.types.includes("text/plain")) {
                        const blob = await item.getType("text/plain");
                        const text = await blob.text();
                        const trimmed = text.trim();
                        if (trimmed.startsWith('<svg') || (trimmed.startsWith('<?xml') && trimmed.includes('<svg'))) {
                            processSvg(trimmed);
                            pastedExternal = true;
                            break;
                        }
                    } else if (item.types.some(type => type.startsWith("image/"))) {
                        const imgType = item.types.find(type => type.startsWith("image/"));
                        const blob = await item.getType(imgType);
                        const reader = new FileReader();
                        reader.onload = () => {
                            const img = new window.Image();
                            img.src = reader.result;
                            img.onload = () => {
                                const maxW = 400;
                                const scale = maxW / img.width;
                                const w = maxW;
                                const h = img.height * scale;
                                addNewImageElement(reader.result, canvasSize?.w / 2, canvasSize?.h / 2, w, h);
                            };
                        };
                        reader.readAsDataURL(blob);
                        pastedExternal = true;
                        break;
                    }
                }
            } catch (err) {
                console.warn("Navigator clipboard read failed, falling back to internal clipboard:", err);
            }
        }

        if (pastedExternal) return;

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
    }

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

    const undoRef = useRef(null);
    const redoRef = useRef(null);

    const [saving, setSaving] = useState(false);

    // History stack for undo/redo
    const historyRef = useRef([]);
    const historyIndexRef = useRef(-1);
    const suppressPushRef = useRef(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    useEffect(() => {
        if (suppressPushRef.current) return;
        try {
            const snap = JSON.parse(JSON.stringify(pushHistory));
            const h = historyRef.current.slice(0, historyIndexRef.current + 1);
            h.push(snap);
            historyRef.current = h;
            historyIndexRef.current = h.length - 1;
            setCanUndo(historyIndexRef.current > 0);
            setCanRedo(false);
        } catch (err) { }
    }, [pushHistory]);

    const undo = () => {
        if (historyIndexRef.current <= 0) return;
        const newIndex = historyIndexRef.current - 1;
        const snap = historyRef.current[newIndex];
        historyIndexRef.current = newIndex;
        suppressPushRef.current = true;
        dispatch(setEditorPages(snap));
        setCanUndo(newIndex > 0);
        setCanRedo(true);
        setTimeout(() => {
            suppressPushRef.current = false;
        }, 0);
    };

    const redo = () => {
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        const newIndex = historyIndexRef.current + 1;
        const snap = historyRef.current[newIndex];
        historyIndexRef.current = newIndex;
        suppressPushRef.current = true;
        dispatch(setEditorPages(snap));
        setCanUndo(true);
        setCanRedo(newIndex < historyRef.current.length - 1);
        setTimeout(() => {
            suppressPushRef.current = false;
        }, 0);
    };

    undoRef.current = undo;
    redoRef.current = redo;

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

                // T (Text Tool shortcut)
                if (!isCtrlOrCmd && keyLower === "t") {
                    e.preventDefault();
                    setIsTextTool(true);
                    dispatch(setPath(undefined));
                }

                // V (Move Tool shortcut)
                if (!isCtrlOrCmd && keyLower === "v") {
                    e.preventDefault();
                    setIsTextTool(false);
                    setIsPenTool(false);
                    dispatch(setPath(undefined));
                }



                // Ctrl/Cmd + Z (Undo)
                if (isCtrlOrCmd && !e.shiftKey && keyLower === "z") {
                    e.preventDefault();
                    if (undoRef.current) undoRef.current();
                }

                // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z (Redo)
                if (isCtrlOrCmd && (keyLower === "y" || (e.shiftKey && keyLower === "z"))) {
                    e.preventDefault();
                    if (redoRef.current) redoRef.current();
                }

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

    // Set up native wheel event listener on stage container for non-passive prevention with rAF batching
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

            let nextZoom = oldScale;
            let nextPos = currentStagePos;

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
                nextZoom = clampedScale;
                nextPos = {
                    x: pointer.x - mousePointTo.x * clampedScale,
                    y: pointer.y - mousePointTo.y * clampedScale,
                };
            } else {
                nextPos = {
                    x: currentStagePos.x - e.deltaX,
                    y: currentStagePos.y - e.deltaY,
                };
            }

            zoomRef.current = nextZoom;
            stagePosRef.current = nextPos;

            // Apply direct transform to Konva stage for instantaneous visual feedback
            stage.scale({ x: nextZoom, y: nextZoom });
            stage.position(nextPos);
            stage.batchDraw();

            pendingZoomRef.current = nextZoom;
            pendingStagePosRef.current = nextPos;

            // Throttled React state update via rAF (at most once per frame)
            if (!wheelRafRef.current) {
                wheelRafRef.current = requestAnimationFrame(() => {
                    wheelRafRef.current = null;
                    if (pendingZoomRef.current !== null) {
                        dispatch(setZoom(pendingZoomRef.current));
                        pendingZoomRef.current = null;
                    }
                    if (pendingStagePosRef.current !== null) {
                        setStagePos(pendingStagePosRef.current);
                        pendingStagePosRef.current = null;
                    }
                });
            }
        };

        container.addEventListener('wheel', handleWheelRaw, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheelRaw);
            if (wheelRafRef.current) {
                cancelAnimationFrame(wheelRafRef.current);
                wheelRafRef.current = null;
            }
        };
    }, [dispatch]);

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
        if (isTextTool) {
            return 'text';
        }
        return 'default';
    };

    const handleStageDrag = useCallback((e) => {
        if (e.target === e.target.getStage()) {
            stagePosRef.current = {
                x: e.target.x(),
                y: e.target.y()
            };
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
            setStagePos({
                x: e.target.x(),
                y: e.target.y()
            });
            return;
        }
        dragStartPositionsRef.current = null;
    }, []);

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

    function addNewImageElement(src, x, y, w = 300, h = 200) {
        const id = `i${Date.now()}`;
        setPagesWithHistory((prev) => {
            const cp = JSON.parse(JSON.stringify(prev));
            const page = cp[activeIndex] || {
                id: activeIndex + 1,
                children: [],
                background: "#ffffff",
            };
            page.children = page.children || [];
            page.children.push({
                id,
                type: "image",
                src,
                x: x - w / 2,
                y: y - h / 2,
                width: w,
                height: h,
                rotation: 0,
                opacity: 1,
            });
            cp[activeIndex] = page;
            return cp;
        });

        setTimeout(() => {
            dispatch(setSelectedUniqueId(id));
        }, 10);
    }

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        const rect = stage.container().getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        const localX = clientX - rect.left;
        const localY = clientY - rect.top;

        // Transform relative to zoom and stage position (offset/pan)
        const x = (localX - stagePos.x) / zoom;
        const y = (localY - stagePos.y) / zoom;

        // 1. Files dropped from local OS
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            files.forEach((file) => {
                if (file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const img = new window.Image();
                        img.src = reader.result;
                        img.onload = () => {
                            const maxW = 400;
                            const scale = maxW / img.width;
                            const w = maxW;
                            const h = img.height * scale;
                            addNewImageElement(reader.result, x, y, w, h);
                        };
                    };
                    reader.readAsDataURL(file);
                }
            });
        } else {
            // 2. Dragged image from sidebar (uploads/photos)
            const draggedMetaStr = e.dataTransfer.getData("image-meta");
            if (draggedMetaStr) {
                try {
                    const dragData = JSON.parse(draggedMetaStr);
                    if (dragData && dragData.previewSrc) {
                        const img = new window.Image();
                        img.src = dragData.hdSrc || dragData.previewSrc;
                        img.onload = () => {
                            const w = dragData.w || 400;
                            const h = dragData.h || 300;
                            addNewImageElement(dragData.hdSrc || dragData.previewSrc, x, y, w, h);
                        };
                        img.onerror = () => {
                            const w = dragData.w || 400;
                            const h = dragData.h || 300;
                            addNewImageElement(dragData.previewSrc, x, y, w, h);
                        };
                    }
                } catch (err) {
                    console.error("Error parsing drag-drop image meta:", err);
                }
            } else {
                // 3. Fallback for raw text/plain (URI lists or direct link drag)
                const textUri = e.dataTransfer.getData("text/plain");
                if (textUri && (textUri.startsWith("http://") || textUri.startsWith("https://") || textUri.startsWith("data:image/"))) {
                    const img = new window.Image();
                    img.src = textUri;
                    img.onload = () => {
                        const maxW = 400;
                        const scale = maxW / img.width;
                        const w = maxW;
                        const h = img.height * scale;
                        addNewImageElement(textUri, x, y, w, h);
                    };
                }
            }
        }
    };

    function setPagesWithHistory(updaterOrPages) {
        const next = typeof updaterOrPages === "function" ? updaterOrPages(editorPages) : updaterOrPages;
        setTimeout(() => setPushHistory(next), 0);
        dispatch(setEditorPages(next));
    }

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



    const addTextAtPosition = (x, y) => {
        const id = `t${Date.now()}`;
        setPagesWithHistory((prev) => {
            const cp = JSON.parse(JSON.stringify(prev));
            const page = cp[activeIndex] || {
                id: activeIndex + 1,
                children: [],
                background: "#ffffff",
            };
            page.children = page?.children || [];
            page?.children?.push({
                id,
                type: "text",
                text: "Tulis teks di sini",
                x,
                y,
                width: 250,
                fontSize: 24,
                fill: "#111827",
                fontFamily: "Roboto",
                autoFocus: true,
            });
            cp[activeIndex] = page;
            return cp;
        });
        dispatch(setSelectedUniqueId(id));
        setIsTextTool(false);
    };

    const handleNavClick = (panelName) => {
        dispatch(setSelectedUniqueId(null));
        dispatch(setPopUp(false));
        
        if (panelName === "text") {
            setIsTextTool(true);
            dispatch(setPath(undefined));
            return;
        }

        setIsTextTool(false);
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
        { name: "chart", label: "Grafik", icon: <IoBarChartOutline /> },
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
                                <UndoRedo
                                    undo={undo}
                                    redo={redo}
                                    canUndo={canUndo}
                                    canRedo={canRedo}
                                />
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
                                <span className={styles.btnText}>{saving ? "Menyimpan..." : "Simpan"}</span>
                            </button>
                        </div>
                    </div>
                </Wrapper>
            </div>

            {/* Left Nav Menu and Canvas split */}
            <div className={styles.mainContentArea}>
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
                                    <span className={styles.navText}>{tab.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </Wrapper>

                {/* Sub Panel Content Sidebar - Absolute Overlay */}
                {(path !== undefined || selectedEl !== undefined) && (
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
                )}

                {/* Canvas Area Panel - wrapped in Wrapper */}
                <Wrapper className={styles.canvasWrapper} width="100%" height="100%" padding="0" hoverable={false} style={{ flex: 1, minHeight: 0 }}>
                    <div className={styles.canvasArea} style={{ height: '100%' }}>
                        <div
                            ref={containerRef}
                            className={styles.stageViewport}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
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
                                    
                                    // Klik stage untuk menempatkan teks baru jika tool Teks aktif
                                    if (isTextTool && (e.target === e.target.getStage() || e.target.name() === 'page-background')) {
                                        const stage = e.target.getStage();
                                        const pos = stage.getRelativePointerPosition();
                                        addTextAtPosition(pos.x, pos.y);
                                        return;
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
                                        const shouldBeLocked = isPenTool || isSpacePressed;
                                        const isCurrentlyLocked = Boolean(el?.locked);
                                        const elementToRender = (shouldBeLocked !== isCurrentlyLocked)
                                            ? { ...el, locked: shouldBeLocked || isCurrentlyLocked }
                                            : el;

                                        return (
                                            <EditorLayer
                                                key={el.id}
                                                el={elementToRender}
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
