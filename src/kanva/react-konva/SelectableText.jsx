import React, { useRef, useState, useEffect } from "react";
import { Text, Transformer } from "react-konva";
import { useKonvaSnapping } from "use-konva-snapping";

export default function SelectableText({ shape, selected, onSelect, onChange}) {
    const ref = useRef();
    const trRef = useRef();
    const [isEditing, setIsEditing] = useState(false);
    const [draftText, setDraftText] = useState(shape?.text || "");

    const { handleDragging, handleDragEnd } = useKonvaSnapping({
        snapRange: 5,
        guidelineColor: "blue",
        guidelineWidth: 1,
        guidelineDash: [4, 4],
        snapToStageCenter: true,
        snapToStageBorders: true,
        snapToShapes: true,
    });

    // Sync draftText when shape.text changes externally
    useEffect(() => {
        if (shape?.text !== undefined) {
            setDraftText(shape.text);
        }
    }, [shape?.text]);

    // Handle autoFocus flag for newly created text elements
    useEffect(() => {
        if (shape?.autoFocus) {
            setIsEditing(true);
            onChange({ ...shape, autoFocus: undefined });
        }
    }, [shape?.autoFocus, onChange, shape]);

    // Dynamic HTML textarea overlay for Figma-like text editing
    useEffect(() => {
        if (!isEditing || !ref.current) return;

        const textNode = ref.current;
        const stage = textNode.getStage();
        if (!stage) return;

        const stageContainer = stage.container();
        const stageBox = stageContainer.getBoundingClientRect();
        
        // Absolute position of the text relative to the stage
        const absPos = textNode.getAbsolutePosition();
        const rotation = textNode.rotation();
        const scaleX = stage.scaleX();
        const scaleY = stage.scaleY();

        // Create HTML textarea
        const textarea = document.createElement("textarea");
        document.body.appendChild(textarea);

        // Styling the textarea overlay to align perfectly with Konva Text
        textarea.value = draftText;
        textarea.style.position = "absolute";
        textarea.style.top = (stageBox.top + window.scrollY + absPos.y) + "px";
        textarea.style.left = (stageBox.left + window.scrollX + absPos.x) + "px";
        
        const width = textNode.width() * scaleX;
        textarea.style.width = width + "px";
        textarea.style.height = "auto";
        textarea.style.zIndex = "10000";
        textarea.style.boxSizing = "border-box";
        
        // Explicitly enable user text selection
        textarea.style.userSelect = "text";
        textarea.style.webkitUserSelect = "text";
        textarea.style.mozUserSelect = "text";
        textarea.style.msUserSelect = "text";
        
        textarea.style.fontSize = (shape.fontSize || 16) * scaleY + "px";
        textarea.style.fontFamily = shape.fontFamily || "sans-serif";
        textarea.style.fontWeight = shape.bold ? "bold" : "normal";
        textarea.style.fontStyle = shape.italic ? "italic" : "normal";
        textarea.style.color = shape.fill || "#000000";
        textarea.style.textAlign = shape.align || "left";
        
        // Reset default styles
        textarea.style.border = "none";
        textarea.style.padding = "0px";
        textarea.style.margin = "0px";
        textarea.style.overflow = "hidden";
        textarea.style.background = "none";
        textarea.style.outline = "none";
        textarea.style.resize = "none";
        textarea.style.lineHeight = textNode.lineHeight() || 1.2;
        textarea.style.whiteSpace = "pre-wrap";
        textarea.style.wordBreak = "break-word";
        
        let transform = "";
        if (rotation) {
            transform += `rotate(${rotation}deg)`;
        }
        textarea.style.transform = transform;
        textarea.style.transformOrigin = "left top";

        // Stop propagation of pointer and touch events so they don't leak into the Konva Stage
        const stopPropagation = (e) => {
            e.stopPropagation();
        };

        textarea.addEventListener("mousedown", stopPropagation);
        textarea.addEventListener("mouseup", stopPropagation);
        textarea.addEventListener("click", stopPropagation);
        textarea.addEventListener("dblclick", stopPropagation);
        textarea.addEventListener("touchstart", stopPropagation);
        textarea.addEventListener("touchend", stopPropagation);
        textarea.addEventListener("keyup", stopPropagation);

        // Auto growing height adjustment
        const autoResize = () => {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
            setDraftText(textarea.value); // Sinkronkan ke state React secara real-time!
        };

        autoResize();
        textarea.addEventListener("input", autoResize);

        textarea.focus();
        textarea.select();

        let isSaved = false;
        
        const saveAndClose = () => {
            if (isSaved) return;
            isSaved = true;
            
            const nextVal = textarea.value;
            setDraftText(nextVal);
            setIsEditing(false);
            if (shape?.text !== nextVal) {
                onChange({ ...shape, text: nextVal });
            }
            
            if (textarea.parentNode) {
                textarea.parentNode.removeChild(textarea);
            }
        };

        const handleKeyDown = (e) => {
            e.stopPropagation(); // Stop keyboard shortcuts from triggering on the stage (e.g. Del deleting elements, Space dragging)
            if (e.key === "Escape") {
                e.preventDefault();
                saveAndClose();
            }
        };

        textarea.addEventListener("blur", saveAndClose);
        textarea.addEventListener("keydown", handleKeyDown);

        return () => {
            textarea.removeEventListener("input", autoResize);
            textarea.removeEventListener("blur", saveAndClose);
            textarea.removeEventListener("keydown", handleKeyDown);
            textarea.removeEventListener("mousedown", stopPropagation);
            textarea.removeEventListener("mouseup", stopPropagation);
            textarea.removeEventListener("click", stopPropagation);
            textarea.removeEventListener("dblclick", stopPropagation);
            textarea.removeEventListener("touchstart", stopPropagation);
            textarea.removeEventListener("touchend", stopPropagation);
            textarea.removeEventListener("keyup", stopPropagation);
            if (textarea.parentNode) {
                textarea.parentNode.removeChild(textarea);
            }
        };
    }, [isEditing, draftText, shape, onChange]);

    const commitEdit = () => {
        if (isEditing) {
            setIsEditing(false);
        }
    };

    useEffect(() => {
        if (selected && !isEditing && trRef.current && ref.current) {
            trRef.current.nodes([ref.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [selected, isEditing]);

    useEffect(() => {
        if (ref.current) {
            ref.current.fill(shape.fill);
            ref.current.getLayer()?.batchDraw();
        }
    }, [shape?.fill]);


    useEffect(() => {
        if (ref.current && shape?.textTransform) {
            setDraftText((text) => {
                if (shape?.textTransform === "lowercase") return String(text)?.toLowerCase();
                if (shape?.textTransform === "uppercase") return String(text)?.toUpperCase();
                 if (shape?.textTransform === "none") return text;
                return text;
            });
        }
    }, [shape?.textTransform]);

    function isLocked(){
      if (shape?.locked) return; 
    }

    if (!shape) return null;

    return (
        <>
            <Text
                ref={ref}
                {...shape}
                
                textDecoration={[
                    shape?.underline ? "underline" : "",
                    shape?.lineThrough ? "line-through" : "",
                ].join(" ")}

                fontStyle={`${shape?.bold ? "bold " : ""}${shape?.italic ? "italic" : ""}`}
                text={draftText}
                draggable={!isEditing && !shape?.locked}
                visible={shape?.visible !== false && !isEditing}
                onMouseDown={(e) => {
                     isLocked();
                    onSelect(e);
                    if (isEditing) commitEdit();
                }}
                onTap={(e) => {
                    isLocked()
                    onSelect(e);
                    if (isEditing) commitEdit();
                }}
                onDblClick={() =>{
                    isLocked() 
                    setIsEditing(true)
                    }}
                onDblTap={() =>{
                    isLocked()
                     setIsEditing(true)
                     }}
                onDragMove={(e) => {
                      isLocked(); 
                    handleDragging(e);
                    e.target.position({ x: e.target.x(), y: e.target.y() });
                }}
                onDragEnd={(e) => {
                     isLocked(); 
                    commitEdit();
                    handleDragEnd(e)
                    onChange({ ...shape, x: e.target.x(), y: e.target.y() });
                }}
                onTransformEnd={() => {
                    isLocked(); 
                    const node = ref.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    const rotation = node.rotation();

                    node.scaleX(1);
                    node.scaleY(1);

                    const width = Math.max(20, node.width() * scaleX);
                    const fontSize = Math.max(6, (shape?.fontSize || 16) * scaleY);

                    commitEdit();
                    onChange({
                        ...shape,
                        x: node.x(),
                        y: node.y(),
                        width: width,
                        fontSize: Math.round(fontSize),
                        rotation: Math.round(rotation),
                    });
                }}

                onMouseEnter={(e) => {
                      isLocked()
                    const stage = e.target.getStage();
                    if (stage) stage.container().style.cursor = isEditing ? "text" : "move";
                }}
                onMouseLeave={(e) => {
                    isLocked() 
                    const stage = e.target.getStage();
                    if (stage) stage.container().style.cursor = "default";
                }}
            />

            {selected && !isEditing && (
                <Transformer
                    ref={trRef}
                    // rotateEnabled
                    enabledAnchors={[
                        "middle-left",
                        "middle-right",
                        
                        "top-center",
                        "bottom-center",

                        "top-left",
                        "top-right",
                        
                        "bottom-left",
                        "bottom-right",
                    ]}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 20 || newBox.height < 10) return oldBox;
                        newBox.width = newBox.width;
                        newBox.height = newBox.height;
                        return newBox;
                    }}
                    onTransformStart={(e) => {
                        const stage = e.target.getStage();
                        if (stage) stage.container().style.cursor = "nwse-resize";
                    }}
                    onTransformEnd={(e) => {
                        const stage = e.target.getStage();
                        if (stage) stage.container().style.cursor = "default";
                    }}
                />
            )}
        </>
    );
}