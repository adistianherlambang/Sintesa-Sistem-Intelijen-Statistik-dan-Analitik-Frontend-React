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
    const fontSize = shape.fontSize !== undefined ? shape.fontSize : 12;
    const valueFontSize = shape.valueFontSize !== undefined ? shape.valueFontSize : fontSize;
    const gridColor = shape.gridColor || "rgba(0,0,0,0.1)";

    const seriesNames = shape.seriesNames || ["Seri 1", "Seri 2"];

    const rawVals = data.flatMap((d) => {
        if (Array.isArray(d.values)) {
            return d.values.map((v) => parseFloat(v) || 0);
        }
        return [parseFloat(d.value) || 0];
    });
    const rawMax = Math.max(...(rawVals.length > 0 ? rawVals : [0]));
    const rawMin = Math.min(...(rawVals.length > 0 ? rawVals : [0]));

    // Dynamic minVal & maxVal based on actual values (allowing negative numbers to start dynamically)
    let minVal, maxVal;
    if (rawMin < 0 && rawMax <= 0) {
        minVal = Math.floor(rawMin * 1.15);
        maxVal = 0;
    } else if (rawMin < 0 && rawMax > 0) {
        minVal = Math.floor(rawMin * 1.15);
        maxVal = Math.ceil(rawMax * 1.15);
    } else {
        minVal = 0;
        maxVal = rawMax > 0 ? Math.ceil(rawMax * 1.15) : 1;
    }
    if (maxVal <= minVal) maxVal = minVal + 1;
    const valRange = maxVal - minVal;

    const totalVal = data.reduce((sum, d) => sum + Math.abs(parseFloat(d.value) || 0), 0) || 1;

    const chartPadding = shape.chartPadding !== undefined ? shape.chartPadding : 25;
    const showAxes = shape.showAxes !== false;

    const hasLabels = showLabels && chartType !== "pie";
    const hasValues = showValues && chartType !== "pie";
    const showYLabels = hasLabels && showAxes;
    
    const maxLabelLen = Math.max(
        Math.round(maxVal).toString().length,
        Math.round(minVal).toString().length
    );
    const paddingLeft = showYLabels ? Math.max(18, maxLabelLen * valueFontSize * 0.6) : 0;
    const paddingBottom = hasLabels ? (chartType === "groupedBar" ? Math.max(52, fontSize * 3.6) : Math.max(18, fontSize * 2.2)) : 0;
    const paddingTop = hasValues ? Math.max(10, valueFontSize * 1.3) : 2;
    const paddingRight = hasLabels ? 4 : 2;

    // chartPadding is the gap between the axes and the actual chart plot area
    const plotWidth = Math.max(10, width - paddingLeft - paddingRight - chartPadding * 2);
    const plotHeight = Math.max(10, height - paddingBottom - paddingTop - chartPadding);

    const zeroRatio = (0 - minVal) / (valRange || 1);
    const clampedZeroRatio = Math.max(0, Math.min(1, zeroRatio));
    const yZero = paddingTop + plotHeight * (1 - clampedZeroRatio);

    const renderChartContent = () => {
        if (chartType === "groupedBar") {
            const groupCount = data.length || 1;
            const maxSeriesCount = Math.max(
                1,
                ...data.map((item) =>
                    Array.isArray(item.values) ? item.values.length : 1
                )
            );
            const groupSlotWidth = plotWidth / groupCount;
            const groupWidth = groupSlotWidth * 0.8;
            const innerGap = Math.min(2, (groupWidth / maxSeriesCount) * 0.1);
            const barWidth = Math.max(
                2,
                (groupWidth - (maxSeriesCount - 1) * innerGap) / maxSeriesCount
            );

            return (
                <Group>
                    {/* Y Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = paddingTop + plotHeight * (1 - ratio);
                        const gridVal = minVal + valRange * ratio;
                        return (
                            <Group key={`grid-${idx}`}>
                                <Line
                                    points={[paddingLeft, y, width - paddingRight, y]}
                                    stroke={gridColor}
                                    strokeWidth={0.5}
                                />
                                {showYLabels && (
                                    <Text
                                        text={gridVal.toFixed(1).replace(/\.0$/, "")}
                                        x={0}
                                        y={y - valueFontSize / 2}
                                        width={paddingLeft - 4}
                                        align="right"
                                        fontSize={valueFontSize}
                                        fill={textColor}
                                    />
                                )}
                            </Group>
                        );
                    })}

                    {/* Axes */}
                    {showAxes && (
                        <Line
                            points={[
                                paddingLeft, paddingTop,
                                paddingLeft, height - paddingBottom,
                                width - paddingRight, height - paddingBottom
                            ]}
                            stroke={textColor}
                            strokeWidth={1}
                        />
                    )}

                    {/* Groups and Bars */}
                    {data.map((item, groupIdx) => {
                        const itemValues = Array.isArray(item.values)
                            ? item.values
                            : [item.value !== undefined ? item.value : 0];
                        const groupX =
                            paddingLeft +
                            chartPadding +
                            groupIdx * groupSlotWidth +
                            (groupSlotWidth - (itemValues.length * barWidth + (itemValues.length - 1) * innerGap)) / 2;

                        return (
                            <Group key={`group-${groupIdx}`}>
                                {itemValues.map((valRaw, subIdx) => {
                                    const val = parseFloat(valRaw) || 0;
                                    const yVal = paddingTop + plotHeight * (1 - (val - minVal) / valRange);
                                    const barX = groupX + subIdx * (barWidth + innerGap);

                                    let barY, barH, valTextY, cornerRadius;
                                    if (val >= 0) {
                                        barY = yVal;
                                        barH = Math.max(1, yZero - yVal);
                                        valTextY = barY - valueFontSize - 2;
                                        cornerRadius = [1.5, 1.5, 0, 0];
                                    } else {
                                        barY = yZero;
                                        barH = Math.max(1, yVal - yZero);
                                        valTextY = barY + barH + 2;
                                        cornerRadius = [0, 0, 1.5, 1.5];
                                    }

                                    return (
                                        <Group key={`subbar-${groupIdx}-${subIdx}`}>
                                            <Rect
                                                x={barX}
                                                y={barY}
                                                width={barWidth}
                                                height={barH}
                                                fill={colors[subIdx % colors.length]}
                                                cornerRadius={cornerRadius}
                                            />
                                            {showValues && (
                                                <Text
                                                    text={val.toString()}
                                                    x={barX - 10}
                                                    y={valTextY}
                                                    width={barWidth + 20}
                                                    align="center"
                                                    fontSize={valueFontSize}
                                                    fontStyle="bold"
                                                    fill={textColor}
                                                />
                                            )}
                                        </Group>
                                    );
                                })}

                                {showLabels && (
                                    <Text
                                        text={item.label}
                                        x={paddingLeft + chartPadding + groupIdx * groupSlotWidth}
                                        y={height - paddingBottom + 4}
                                        width={groupSlotWidth}
                                        align="center"
                                        fontSize={fontSize - 1}
                                        fill={textColor}
                                        wrap="word"
                                    />
                                )}
                            </Group>
                        );
                    })}

                    {/* Legend for Series */}
                    {showLabels && seriesNames && seriesNames.length > 0 && (() => {
                        const activeSeries = seriesNames.slice(0, maxSeriesCount);
                        const legendFontSize = Math.max(8, Math.round(fontSize * 0.85));
                        const boxSize = Math.max(6, Math.round(legendFontSize * 0.75));
                        const gapBoxText = Math.max(3, Math.round(legendFontSize * 0.35));
                        const itemGap = Math.max(12, Math.round(legendFontSize * 1.5));

                        const itemWidths = activeSeries.map((sName) => boxSize + gapBoxText + (String(sName).length * legendFontSize * 0.6));
                        const totalWidth = itemWidths.reduce((a, b) => a + b, 0) + (activeSeries.length - 1) * itemGap;
                        const startX = Math.max(0, (width - totalWidth) / 2);
                        const legendY = height - paddingBottom + fontSize + Math.round(legendFontSize * 0.4);

                        let currentX = startX;

                        return (
                            <Group y={legendY}>
                                {activeSeries.map((sName, idx) => {
                                    const itemX = currentX;
                                    currentX += itemWidths[idx] + itemGap;
                                    return (
                                        <Group key={`legend-${idx}`} x={itemX}>
                                            <Rect
                                                width={boxSize}
                                                height={boxSize}
                                                fill={colors[idx % colors.length]}
                                                y={Math.round((legendFontSize - boxSize) / 2)}
                                                cornerRadius={Math.max(1, boxSize * 0.15)}
                                            />
                                            <Text
                                                text={String(sName)}
                                                x={boxSize + gapBoxText}
                                                y={0}
                                                fontSize={legendFontSize}
                                                fill={textColor}
                                            />
                                        </Group>
                                    );
                                })}
                            </Group>
                        );
                    })()}
                </Group>
            );
        }

        if (chartType === "bar") {
            const barCount = data.length;
            const barWidth = (plotWidth / barCount) * 0.7;
            const barGap = (plotWidth / barCount) * 0.3;

            return (
                <Group>
                    {/* Y Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = paddingTop + plotHeight * (1 - ratio);
                        const gridVal = minVal + valRange * ratio;
                        return (
                            <Group key={`grid-${idx}`}>
                                <Line
                                    points={[paddingLeft, y, width - paddingRight, y]}
                                    stroke={gridColor}
                                    strokeWidth={0.5}
                                />
                                {showYLabels && (
                                    <Text
                                        text={gridVal.toFixed(1).replace(/\.0$/, "")}
                                        x={0}
                                        y={y - valueFontSize / 2}
                                        width={paddingLeft - 4}
                                        align="right"
                                        fontSize={valueFontSize}
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
                        const yVal = paddingTop + plotHeight * (1 - (val - minVal) / valRange);
                        const x = paddingLeft + chartPadding + idx * (barWidth + barGap) + barGap / 2;

                        let barY, barH, valTextY, cornerRadius;
                        if (val >= 0) {
                            barY = yVal;
                            barH = Math.max(1, yZero - yVal);
                            valTextY = barY - valueFontSize - 2;
                            cornerRadius = [1.5, 1.5, 0, 0];
                        } else {
                            barY = yZero;
                            barH = Math.max(1, yVal - yZero);
                            valTextY = barY + barH + 2;
                            cornerRadius = [0, 0, 1.5, 1.5];
                        }

                        return (
                            <Group key={`bar-${idx}`}>
                                <Rect
                                    x={x}
                                    y={barY}
                                    width={barWidth}
                                    height={barH}
                                    fill={colors[idx % colors.length]}
                                    cornerRadius={cornerRadius}
                                />
                                {showValues && (
                                    <Text
                                        text={val.toString()}
                                        x={x - 10}
                                        y={valTextY}
                                        width={barWidth + 20}
                                        align="center"
                                        fontSize={valueFontSize}
                                        fontStyle="bold"
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
                const y = paddingTop + plotHeight * (1 - (val - minVal) / valRange);
                points.push(x, y);
            });

            return (
                <Group>
                    {/* Y Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = paddingTop + plotHeight * (1 - ratio);
                        const gridVal = minVal + valRange * ratio;
                        return (
                            <Group key={`grid-${idx}`}>
                                <Line
                                    points={[paddingLeft, y, width - paddingRight, y]}
                                    stroke={gridColor}
                                    strokeWidth={0.5}
                                />
                                {showYLabels && (
                                    <Text
                                        text={gridVal.toFixed(1).replace(/\.0$/, "")}
                                        x={0}
                                        y={y - valueFontSize / 2}
                                        width={paddingLeft - 4}
                                        align="right"
                                        fontSize={valueFontSize}
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
                        const y = paddingTop + plotHeight * (1 - (val - minVal) / valRange);
                        const labelWidth = lineCount > 1 ? stepX : plotWidth;
                        const valStr = val.toString();
                        const valWidth = Math.max(40, valStr.length * valueFontSize * 0.7);

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
                                        text={valStr}
                                        x={x - valWidth / 2}
                                        y={val >= 0 ? y - valueFontSize - 5 : y + 6}
                                        width={valWidth}
                                        align="center"
                                        fontSize={valueFontSize}
                                        fontStyle="bold"
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
                        const pieValStr = `${Math.round((val / totalVal) * 100)}%`;
                        const pieValWidth = Math.max(40, pieValStr.length * valueFontSize * 0.7);
                        const labelX = centerX + Math.cos(midAngleRad) * labelRadius - pieValWidth / 2;
                        const labelY = centerY + Math.sin(midAngleRad) * labelRadius - valueFontSize / 2;

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
                                        text={pieValStr}
                                        x={labelX}
                                        y={labelY}
                                        width={pieValWidth}
                                        align="center"
                                        fontSize={valueFontSize}
                                        fontStyle="bold"
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
                    const currentFontSize = shape.fontSize !== undefined ? shape.fontSize : 12;
                    const newFontSize = Math.max(4, Math.min(100, Math.round(currentFontSize * scale)));
                    const currentValFontSize = shape.valueFontSize !== undefined ? shape.valueFontSize : currentFontSize;
                    const newValFontSize = Math.max(4, Math.min(100, Math.round(currentValFontSize * scale)));
                    
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
                        valueFontSize: shape.valueFontSize !== undefined ? newValFontSize : undefined,
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
