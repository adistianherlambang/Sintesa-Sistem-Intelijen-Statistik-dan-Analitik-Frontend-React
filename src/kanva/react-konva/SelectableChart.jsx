import React, { useRef, useEffect } from "react";
import { Group, Rect, Line, Circle, Text, Arc, Transformer } from "react-konva";
import { useKonvaSnapping } from "use-konva-snapping";

export default function SelectableChart({ shape, selected, onSelect, onChange }) {
    const groupRef = useRef();
    const trRef = useRef();

    const { handleDragging, handleDragEnd } = useKonvaSnapping({
        snapRange: 5,
        guidelineColor: "blue",
        guidelineWidth: 1,
        guidelineDash: [4, 4],
        snapToStageCenter: true,
        snapToStageBorders: true,
        snapToShapes: true,
    });

    useEffect(() => {
        if (selected && trRef.current && groupRef.current) {
            trRef.current.nodes([groupRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [selected]);

    if (!shape) return null;

    const width = shape.width || 250;
    const height = shape.height || 180;
    const chartType = shape.chartType || "bar";
    const data = shape.data || [
        { label: "Kategori A", value: 30 },
        { label: "Kategori B", value: 65 },
        { label: "Kategori C", value: 45 },
    ];
    const colors = shape.colors || ["#AD6832", "#F4913E", "#FEBD23", "#34B34A", "#2da140"];
    const showLabels = shape.showLabels !== false;
    const showValues = shape.showValues !== false;
    const textColor = shape.textColor || "#111827";
    const fontSize = shape.fontSize || 8;
    const gridColor = shape.gridColor || "rgba(0,0,0,0.1)";

    const maxVal = Math.max(...data.map((d) => parseFloat(d.value) || 0), 1);
    const totalVal = data.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0) || 1;

    // Margins for rendering axes
    const marginY = 25; // bottom label area
    const marginX = 25; // left axis area
    const plotWidth = width - marginX - 10;
    const plotHeight = height - marginY - 10;

    const renderChartContent = () => {
        if (chartType === "bar") {
            const barCount = data.length;
            const barWidth = (plotWidth / barCount) * 0.7;
            const barGap = (plotWidth / barCount) * 0.3;

            return (
                <Group>
                    {/* Y Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = 10 + plotHeight * (1 - ratio);
                        return (
                            <Group key={`grid-${idx}`}>
                                <Line
                                    points={[marginX, y, width - 10, y]}
                                    stroke={gridColor}
                                    strokeWidth={0.5}
                                />
                                {showLabels && (
                                    <Text
                                        text={Math.round(maxVal * ratio).toString()}
                                        x={0}
                                        y={y - fontSize / 2}
                                        width={marginX - 4}
                                        align="right"
                                        fontSize={fontSize}
                                        fill={textColor}
                                    />
                                )}
                            </Group>
                        );
                    })}

                    {/* X & Y Axis Lines */}
                    <Line
                        points={[marginX, 10, marginX, 10 + plotHeight, width - 10, 10 + plotHeight]}
                        stroke={textColor}
                        strokeWidth={1}
                    />

                    {/* Bars */}
                    {data.map((item, idx) => {
                        const val = parseFloat(item.value) || 0;
                        const h = (val / maxVal) * plotHeight;
                        const x = marginX + idx * (barWidth + barGap) + barGap / 2;
                        const y = 10 + plotHeight - h;

                        return (
                            <Group key={`bar-${idx}`}>
                                <Rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={h}
                                    fill={colors[idx % colors.length]}
                                    cornerRadius={[1.5, 1.5, 0, 0]}
                                />
                                {showValues && (
                                    <Text
                                        text={val.toString()}
                                        x={x - 10}
                                        y={y - fontSize - 2}
                                        width={barWidth + 20}
                                        align="center"
                                        fontSize={fontSize}
                                        bold
                                        fill={textColor}
                                    />
                                )}
                                {showLabels && (
                                    <Text
                                        text={item.label}
                                        x={x - 10}
                                        y={10 + plotHeight + 4}
                                        width={barWidth + 20}
                                        align="center"
                                        fontSize={fontSize - 1}
                                        fill={textColor}
                                        wrap="none"
                                    />
                                )}
                            </Group>
                        );
                    })}
                </Group>
            );
        }

        if (chartType === "line") {
            const lineCount = data.length;
            const stepX = lineCount > 1 ? plotWidth / (lineCount - 1) : plotWidth;
            const points = [];

            data.forEach((item, idx) => {
                const val = parseFloat(item.value) || 0;
                const x = marginX + idx * stepX;
                const y = 10 + plotHeight - (val / maxVal) * plotHeight;
                points.push(x, y);
            });

            return (
                <Group>
                    {/* Y Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = 10 + plotHeight * (1 - ratio);
                        return (
                            <Group key={`grid-${idx}`}>
                                <Line
                                    points={[marginX, y, width - 10, y]}
                                    stroke={gridColor}
                                    strokeWidth={0.5}
                                />
                                {showLabels && (
                                    <Text
                                        text={Math.round(maxVal * ratio).toString()}
                                        x={0}
                                        y={y - fontSize / 2}
                                        width={marginX - 4}
                                        align="right"
                                        fontSize={fontSize}
                                        fill={textColor}
                                    />
                                )}
                            </Group>
                        );
                    })}

                    {/* Axes */}
                    <Line
                        points={[marginX, 10, marginX, 10 + plotHeight, width - 10, 10 + plotHeight]}
                        stroke={textColor}
                        strokeWidth={1}
                    />

                    {/* Line Path */}
                    {points.length > 0 && (
                        <Line
                            points={points}
                            stroke={colors[0]}
                            strokeWidth={2}
                            tension={0.2}
                        />
                    )}

                    {/* Nodes & Labels */}
                    {data.map((item, idx) => {
                        const val = parseFloat(item.value) || 0;
                        const x = marginX + idx * stepX;
                        const y = 10 + plotHeight - (val / maxVal) * plotHeight;

                        return (
                            <Group key={`node-${idx}`}>
                                <Circle
                                    x={x}
                                    y={y}
                                    radius={3.5}
                                    fill="#ffffff"
                                    stroke={colors[0]}
                                    strokeWidth={2}
                                />
                                {showValues && (
                                    <Text
                                        text={val.toString()}
                                        x={x - 20}
                                        y={y - fontSize - 5}
                                        width={40}
                                        align="center"
                                        fontSize={fontSize}
                                        bold
                                        fill={textColor}
                                    />
                                )}
                                {showLabels && (
                                    <Text
                                        text={item.label}
                                        x={x - 25}
                                        y={10 + plotHeight + 4}
                                        width={50}
                                        align="center"
                                        fontSize={fontSize - 1}
                                        fill={textColor}
                                    />
                                )}
                            </Group>
                        );
                    })}
                </Group>
            );
        }

        if (chartType === "pie") {
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(plotWidth, plotHeight) / 2 * 0.9;
            let startAngle = 0;

            return (
                <Group>
                    {data.map((item, idx) => {
                        const val = parseFloat(item.value) || 0;
                        const angle = (val / totalVal) * 360;
                        const currentStart = startAngle;
                        startAngle += angle;

                        // Calculate label position at midpoint of arc
                        const midAngleRad = ((currentStart + angle / 2) * Math.PI) / 180;
                        const labelRadius = radius * 0.6;
                        const labelX = centerX + Math.cos(midAngleRad) * labelRadius - 20;
                        const labelY = centerY + Math.sin(midAngleRad) * labelRadius - fontSize / 2;

                        return (
                            <Group key={`pie-${idx}`}>
                                <Arc
                                    x={centerX}
                                    y={centerY}
                                    innerRadius={0}
                                    outerRadius={radius}
                                    startAngle={currentStart}
                                    angle={angle}
                                    fill={colors[idx % colors.length]}
                                    stroke="#ffffff"
                                    strokeWidth={1}
                                />
                                {showValues && val > 0 && (
                                    <Text
                                        text={`${Math.round((val / totalVal) * 100)}%`}
                                        x={labelX}
                                        y={labelY}
                                        width={40}
                                        align="center"
                                        fontSize={fontSize - 1}
                                        bold
                                        fill="#ffffff"
                                    />
                                )}
                            </Group>
                        );
                    })}

                    {/* Small Legend below/side of pie */}
                    {showLabels && (
                        <Group x={10} y={height - 20}>
                            {data.slice(0, 4).map((item, idx) => {
                                const xPos = idx * (width / Math.min(data.length, 4));
                                return (
                                    <Group key={`legend-${idx}`} x={xPos}>
                                        <Rect
                                            width={6}
                                            height={6}
                                            fill={colors[idx % colors.length]}
                                            y={2}
                                        />
                                        <Text
                                            text={item.label.substring(0, 10)}
                                            x={10}
                                            fontSize={fontSize - 1}
                                            fill={textColor}
                                        />
                                    </Group>
                                );
                            })}
                        </Group>
                    )}
                </Group>
            );
        }

        return null;
    };

    return (
        <>
            <Group
                ref={groupRef}
                x={shape.x || 0}
                y={shape.y || 0}
                draggable={!shape.locked}
                visible={shape.visible !== false}
                onClick={onSelect}
                onTap={onSelect}
                onDragMove={(e) => {
                    if (shape.locked) return;
                    handleDragging(e);
                    e.target.position({ x: e.target.x(), y: e.target.y() });
                }}
                onDragEnd={(e) => {
                    if (shape.locked) return;
                    handleDragEnd(e);
                    onChange({ ...shape, x: e.target.x(), y: e.target.y() });
                }}
                onTransformEnd={() => {
                    if (shape.locked) return;
                    const node = groupRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shape,
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(100, (shape.width || 250) * scaleX),
                        height: Math.max(80, (shape.height || 180) * scaleY),
                    });
                }}
            >
                {/* Border background when selected */}
                {selected && (
                    <Rect
                        width={width}
                        height={height}
                        stroke="#34B34A"
                        strokeWidth={1}
                        dash={[4, 4]}
                    />
                )}

                {/* Render the actual chart (bars/line/pie) */}
                {renderChartContent()}
            </Group>
            {selected && <Transformer ref={trRef} rotateEnabled={false} keepRatio={false} />}
        </>
    );
}
