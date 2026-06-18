import { Group } from "react-konva";
import { useKonvaSnapping } from 'use-konva-snapping';
import { useDispatch, useSelector } from 'react-redux';
import { setPopUp, setSelectedUniqueId } from '../store/editorReducer';

import SelectableText from '../react-konva/SelectableText';
import SelectableRect from '../react-konva/SelectableRect';
import SelectableImage from '../react-konva/SelectableImage';
import SelectableIcon from '../react-konva/SelectableIcon';
import SelectableCircul from '../react-konva/SelectableCircul';
import SelectableTriangle from '../react-konva/SelectableTriangle';
import SelectableStar from '../react-konva/SelectableStar';
import SelectableArrow from '../react-konva/SelectableArrow';
import SelectableLine from '../react-konva/SelectableLine';
import SelectablePolygon from '../react-konva/SelectablePolygon';

const EditorLayer = ({ el, setElement, stageRef, isSpacePressed }) => {
    const dispatch = useDispatch();
    const { selectedUniqueId } = useSelector((state) => state?.editor ?? {});

    const { handleDragging, handleDragEnd } = useKonvaSnapping({
        snapRange: 5,
        guidelineColor: "blue",
        guidelineWidth: 1,
        guidelineDash: [4, 4],
        snapToStageCenter: true,
        snapToStageBorders: true,
        snapToShapes: true,
    });

    if (!el) return null;

    const isSelected = Array.isArray(selectedUniqueId)
        ? selectedUniqueId.includes(el?.id)
        : selectedUniqueId === el?.id;

    function handleOnes(id, e) {
        if (isSpacePressed) return;
        const isShift = e?.evt?.shiftKey || false;

        if (isShift) {
            const currentSelection = selectedUniqueId;
            let nextSelection;
            if (!currentSelection) {
                nextSelection = [id];
            } else if (Array.isArray(currentSelection)) {
                if (currentSelection.includes(id)) {
                    nextSelection = currentSelection.filter((x) => x !== id);
                } else {
                    nextSelection = [...currentSelection, id];
                }
            } else {
                if (currentSelection === id) {
                    nextSelection = null;
                } else {
                    nextSelection = [currentSelection, id];
                }
            }
            if (Array.isArray(nextSelection) && nextSelection.length === 0) {
                nextSelection = null;
            }
            dispatch(setSelectedUniqueId(nextSelection));
        } else {
            dispatch(setSelectedUniqueId(id));
        }
        dispatch(setPopUp(false));
    };

    if (el?.type === "text") {
        return <SelectableText key={el?.id} shape={el} selected={isSelected} stageRef={stageRef}
            onSelect={(e) => handleOnes(el?.id, e)}
            onChange={(next) => setElement(el?.id, () => next)}
        />;
    }

    if (el?.type === "banner" || el?.type === "group") {
        return (
            <Group
                key={el?.id}
                x={el?.x || 0}
                y={el?.y || 0}
                draggable={!isSpacePressed}
                onClick={(e) => handleOnes(el?.id, e)}
                onTap={(e) => handleOnes(el?.id, e)}
                onDragMove={(e) => {
                    if (isSpacePressed) return;
                    handleDragging(e);
                }}
                onDragEnd={(e) => {
                    if (isSpacePressed) return;
                    handleDragEnd(e)
                }}
            >
                {(el?.children || [])?.map((child) => (
                    <EditorLayer
                        key={child?.id}
                        el={child}
                        setElement={(id, updater) => {
                            setElement(el?.id, (banner) => {
                                const updatedChildren = banner?.children?.map((c) =>
                                    c?.id === id ? updater(c) : c
                                );
                                return { ...banner, children: updatedChildren };
                            });
                        }}
                        stageRef={stageRef}
                        isSpacePressed={isSpacePressed}
                    />
                ))}
            </Group>
        );
    }

    if (el?.type === "icon") {
        return (
            <SelectableIcon
                key={el?.id}
                shape={el}
                selected={isSelected}
                onSelect={(e) => handleOnes(el?.id, e)}
                onChange={(next) => setElement(el?.id, () => next)}
            />
        );
    }
    if (el?.type === "image") {
        return <SelectableImage
            key={el?.id}
            shape={el}
            selected={isSelected}
            onSelect={(e) => handleOnes(el?.id, e)}
            onChange={(next) => setElement(el?.id, () => next)}
        />;
    }

    if (el?.type === "rect") {
        return <SelectableRect key={el?.id} shape={el} selected={isSelected}
            onSelect={(e) => handleOnes(el?.id, e)}
            onChange={(next) => setElement(el?.id, () => next)}
        />;
    }

    if (el?.type === "circle") {
        return <SelectableCircul key={el?.id} shape={el} selected={isSelected}
            onSelect={(e) => handleOnes(el?.id, e)}
            onChange={(next) => setElement(el?.id, () => next)}
        />;
    }

    if (el?.type === "triangle") {
        return <SelectableTriangle key={el?.id} shape={el} selected={isSelected}
            onSelect={(e) => handleOnes(el?.id, e)}
            onChange={(next) => setElement(el?.id, () => next)}
        />;
    }

    if (el?.type === "star") {
        return <SelectableStar key={el?.id} shape={el} selected={isSelected}
            onSelect={(e) => handleOnes(el?.id, e)}
            onChange={(next) => setElement(el?.id, () => next)}
        />;
    }


    if (el?.type === "arrow") {
        return (
            <SelectableArrow
                key={el?.id}
                shape={el}
                selected={isSelected}
                onSelect={(e) => handleOnes(el?.id, e)}
                onChange={(next) => setElement(el?.id, () => next)}
            />
        );
    }

    if (el?.type === "line") {
        return (
            <SelectableLine
                key={el?.id}
                shape={el}
                selected={isSelected}
                onSelect={(e) => handleOnes(el?.id, e)}
                onChange={(next) => setElement(el?.id, () => next)}
            />
        );
    }

    if (el?.type === "polygon") {
        return (
            <SelectablePolygon
                key={el?.id}
                shape={el}
                selected={isSelected}
                onSelect={(e) => handleOnes(el?.id, e)}
                onChange={(next) => setElement(el?.id, () => next)}
            />
        );
    }

    return null;
}

export default EditorLayer; 