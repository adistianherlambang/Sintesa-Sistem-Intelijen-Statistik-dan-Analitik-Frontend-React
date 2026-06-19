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

    const chartPadding = shape.chartPadding !== undefined ? shape.chartPadding : 25;
    const showAxes = shape.showAxes !== false;

    // Sensible base margins that scale with font size and adapt to visibility flags to fit the selection box closer to content
    const hasLabels = showLabels && chartType !== "pie";
    const hasValues = showValues && chartType !== "pie";
    const paddingLeft = hasLabels ? Math.max(30, fontSize * 3.5) : 0;
    const paddingBottom = hasLabels ? Math.max(30, fontSize * 3.5) : 0;
    const paddingTop = hasValues ? Math.max(12, fontSize * 1.5) : 2;
    const paddingRight = hasLabels ? 8 : 2;

    // chartPadding is the gap between the axes and the actual chart plot area
    const plotWidth = Math.max(10, width - paddingLeft - paddingRight - chartPadding * 2);
    const plotHeight = Math.max(10, height - paddingBottom - paddingTop - chartPadding);

    const renderChartContent = () => {
        if (chartType === "bar") {
            const barCount = data.length;
            const barWidth = (plotWidth / barCount) * 0.7;
            const barGap = (plotWidth / barCount) * 0.3;

            return (
                <Group>
                    {/* Y Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = paddingTop + plotHeight * (1 - ratio);
                        return (
                            <Group key={`grid-${idx}`}>
                                <Line
                                    points={[paddingLeft, y, width - paddingRight, y]}
                                    stroke={gridColor}
                                    strokeWidth={0.5}
                                />
                                {showLabels && (
                                    <Text
                                        text={Math.round(maxVal * ratio).toString()}
                                        x={0}
                                        y={y - fontSize / 2}
                                        width={paddingLeft - 4}
                                        align="right"
                                        fontSize={fontSize}
                                        fill={textColor}
                                    />
                                )}
                            </Group>
                        );
                    })}

                    {/* X & Y Axis Lines */}
                    {showAxes && (
                        <Line
                            points={[paddingLeft, paddingTop, paddingLeft, height - paddingBottom, width - paddingRight, height - paddingBottom]}
                            stroke={textColor}
                            strokeWidth={1}
                        />
                    )}

                    {/* Bars */}
                    {data.map((item, idx) => {
                        const val = parseFloat(item.value) || 0;
                        const h = (val / maxVal) * plotHeight;
                        const x = paddingLeft + chartPadding + idx * (barWidth + barGap) + barGap / 2;
                        const y = paddingTop + plotHeight - h;

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
                                        x={paddingLeft + chartPadding + idx * (barWidth + barGap)}
                                        y={height - paddingBottom + 4}
                                        width={barWidth + barGap}
                                        align="center"
                                        fontSize={fontSize - 1}
                                        fill={textColor}
                                        wrap="word"
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
                const x = paddingLeft + chartPadding + idx * stepX;
                const y = paddingTop + plotHeight - (val / maxVal) * plotHeight;
                points.push(x, y);
            });

            return (
                <Group>
                    {/* Y Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = paddingTop + plotHeight * (1 - ratio);
                        return (
                            <Group key={`grid-${idx}`}>
                                <Line
                                    points={[paddingLeft, y, width - paddingRight, y]}
                                    stroke={gridColor}
                                    strokeWidth={0.5}
                                />
                                {showLabels && (
                                    <Text
                                        text={Math.round(maxVal * ratio).toString()}
                                        x={0}
                                        y={y - fontSize / 2}
                                        width={paddingLeft - 4}
                                        align="right"
                                        fontSize={fontSize}
                                        fill={textColor}
                                    />
                                )}
                            </Group>
                        );
                    })}

                    {/* Axes */}
                    {showAxes && (
                        <Line
                            points={[paddingLeft, paddingTop, paddingLeft, height - paddingBottom, width - paddingRight, height - paddingBottom]}
                            stroke={textColor}
                            strokeWidth={1}
                        />
                    )}

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
                        const x = paddingLeft + chartPadding + idx * stepX;
                        const y = paddingTop + plotHeight - (val / maxVal) * plotHeight;
                        const labelWidth = lineCount > 1 ? stepX : plotWidth;

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
                                        x={x - labelWidth / 2}
                                        y={height - paddingBottom + 4}
                                        width={labelWidth}
                                        align="center"
                                        fontSize={fontSize - 1}
                                        fill={textColor}
                                        wrap="word"
                                    />
                                )}
                            </Group>
                        );
                    })}
                </Group>
            );
        }

        if (chartType === "pie") {
            const effectiveHeight = showLabels ? Math.max(50, height - 25) : height;
            const centerX = width / 2;
            const centerY = effectiveHeight / 2;
            const radiusFactor = chartPadding === 0 ? 1.0 : 0.95;
            const radius = Math.max(10, (Math.min(width, effectiveHeight) - chartPadding * 2) / 2 * radiusFactor);
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
                        <Group x={10} y={height - Math.max(15, chartPadding)}>
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
                    
                    let newWidth = Math.max(100, (shape.width || 250) * scaleX);
                    let newHeight = Math.max(80, (shape.height || 180) * scaleY);
                    
                    // Scale the font size proportionally with the resize
                    const scale = (scaleX + scaleY) / 2;
                    const currentFontSize = shape.fontSize || 8;
                    const newFontSize = Math.max(4, Math.min(24, Math.round(currentFontSize * scale)));
                    
                    if (chartType === "pie") {
                        const size = Math.max(100, Math.round((newWidth + newHeight) / 2));
                        newWidth = size;
                        newHeight = size;
                    }
                    
                    onChange({
                        ...shape,
                        x: node.x(),
                        y: node.y(),
                        width: newWidth,
                        height: newHeight,
                        fontSize: newFontSize,
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
            {selected && (
                <Transformer
                    ref={trRef}
                    rotateEnabled={false}
                    keepRatio={chartType === "pie"}
                    enabledAnchors={
                        chartType === "pie"
                            ? ["top-left", "top-right", "bottom-left", "bottom-right"]
                            : ["top-left", "top-right", "bottom-left", "bottom-right", "top-center", "bottom-center", "left-center", "right-center"]
                    }
                />
            )}
        </>
    );
}
