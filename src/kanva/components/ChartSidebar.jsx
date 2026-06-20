import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Button } from "./UIControls";
import { FaChartBar, FaChartLine, FaChartPie } from "react-icons/fa";
import styles from "./Sidebar.module.css";
import { setSelectedUniqueId } from "../store/editorReducer";

export default function ChartSidebar({ setPagesWithHistory, openMiniFor }) {
    const { activeIndex } = useSelector((state) => state?.editor ?? {});
    const dispatch = useDispatch();

    const addChart = (chartType) => {
        const id = `chart-${Date.now()}`;
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
                type: "chart",
                chartType,
                x: 50,
                y: 100,
                width: chartType === "pie" ? 180 : 200,
                height: chartType === "pie" ? 180 : 150,
                data: [
                    { label: "Kategori A", value: 30 },
                    { label: "Kategori B", value: 65 },
                    { label: "Kategori C", value: 45 },
                ],
                colors: ["#AD6832", "#F4913E", "#FEBD23"],
                showLabels: true,
                showValues: true,
                textColor: "#111827",
                fontSize: 8,
                gridColor: "rgba(0,0,0,0.15)",
                rotation: 0
            });
            cp[activeIndex] = page;
            return cp;
        });

        // Set seleksi elemen baru
        dispatch(setSelectedUniqueId(id));
    };

    return (
        <div style={{ padding: "16px 0px" }}>
            <p className={styles.sectionTitle} style={{ marginBottom: "16px", color: "rgba(255, 255, 255, 0.6)", fontSize: 13 }}>
                Pilih jenis grafik untuk ditambahkan ke infografis Anda:
            </p>
            <Row gutter={[12, 12]}>
                <Col span={24}>
                    <Button
                        block
                        type="primary"
                        icon={<FaChartBar size={20} />}
                        style={{
                            height: 55,
                            fontSize: 15,
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            borderColor: "rgba(255,255,255,0.1)",
                            color: "#fff"
                        }}
                        onClick={() => addChart("bar")}
                    >
                        Grafik Batang (Bar)
                    </Button>
                </Col>
                <Col span={24}>
                    <Button
                        block
                        icon={<FaChartLine size={20} />}
                        style={{
                            height: 55,
                            fontSize: 15,
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            borderColor: "rgba(255,255,255,0.1)",
                            color: "#fff"
                        }}
                        onClick={() => addChart("line")}
                    >
                        Grafik Garis (Line)
                    </Button>
                </Col>
                <Col span={24}>
                    <Button
                        block
                        icon={<FaChartPie size={20} />}
                        style={{
                            height: 55,
                            fontSize: 15,
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            borderColor: "rgba(255,255,255,0.1)",
                            color: "#fff"
                        }}
                        onClick={() => addChart("pie")}
                    >
                        Grafik Lingkaran (Pie)
                    </Button>
                </Col>
            </Row>
        </div>
    );
}
