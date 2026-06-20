
import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Image, Space, Skeleton } from "./UIControls";
import { Stage, Layer, Rect, Text, Image as KonvaImage } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUniqueId, setPopUp, setCanvasSize } from "../store/editorReducer";
import SelectableChart from "../react-konva/SelectableChart";

import axios from 'axios'

import tea from "../assets/tea.png";
import banner7 from "../assets/banner-7.png";
import banner8 from "../assets/banner-8.png";
import banner9 from "../assets/banner-9.png";
import banner10 from "../assets/banner-10.png";
import banner11 from "../assets/banner-11.png";
// asset infografis bps
import infografisFooter from "../assets/InfografisFooter.png"
import infografisBackground from "../assets/infografisBackground.png"

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

const now = new Date();
const year = now.getFullYear()
const month = now.toLocaleString('id-ID', { month: 'long' });

const locationName =
    JSON.parse(localStorage.getItem("user-storage"))
        ?.state?.user?.location?.name

const getInflasi = async () => {
    try {
        const res = await axios.post(
            `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi-infografis`,
            {
                kota: locationName
            }
        );

        return res.data;
    } catch (err) {
        console.error(err.message);
        return null;
    }
};

const inflasiData = await getInflasi()

const getIHK = async () => {
    try {
        const res = await axios.post(
            `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/ihk-infografis`,
            {
                kota: locationName
            }
        );

        return res.data;
    } catch (err) {
        console.error(err.message);
        return null;
    }
};

const IHKData = await getIHK()

const getKomoditas = async () => {
    try {
        const res = await axios.post(
            `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/komoditas-infografis`,
            {
                kota: locationName
            }
        );

        return res.data;
    } catch (err) {
        console.error(err.message);
        return null;
    }
};

const komoditasData = await getKomoditas()

const getSummary = async () => {
    try {
        const res = await axios.post(
            `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/aisummary`,
            {
                kota: locationName
            }
        );

        return res.data;
    } catch (err) {
        console.error(err.message);
        return null;
    }
}

const summary = await getSummary()

const banners = [
    {
        name: `Infografis ${locationName} ${month} ${year}`,
        type: "banner",
        w: 300,
        h: 425,
        x: 0,
        y: 0,
        children: [
            {
                id: `b${Date.now()}-bg-photo`,
                type: "image",
                x: 0,
                y: 0,
                width: 300,
                height: 425,
                src: infografisBackground,
            },
            {
                id: `b${Date.now()}-footer-photo`,
                type: "image",
                x: 0,
                y: 381,
                width: 300,
                height: 44.5,
                src: infografisFooter,
            },
            {
                id: `b${Date.now()}-footer-text`,
                type: "text",
                text: `BADAN PUSAT STATISTIK\n${locationName.toUpperCase()}\nhttps://website.bps.go.id`,
                x: 239,
                y: 405,
                fontSize: 4.1,
                fontFamily: "Montserrat",
                italic: true,
                bold: true,
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-title-text`,
                type: "text",
                text: `PERKEMBANGAN\nINDEKS HARGA KONSUMEN\n${locationName.toUpperCase()} ${month.toUpperCase()} ${year}`,
                x: 10,
                y: 20,
                fontSize: 15,
                fontFamily: "Montserrat",
                fontStyle: "bold",
                bold: true,
                fill: "#AD6832",
            },
            {
                id: `b${Date.now()}-brs-no`,
                type: "text",
                text: `Berita Resmi Statistik No. `,
                x: 10,
                y: 70,
                fontSize: 8,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                bold: true,
                fill: "#000000ff",
            },
            {
                id: `b${Date.now()}-qr`,
                type: "rect",
                x: 240,
                y: 20,
                width: 50,
                height: 50,
                fill: "#000000ff",
            },
            {
                id: `b${Date.now()}-qr-text`,
                type: "text",
                text: `QR Code`,
                x: 247,
                y: 40,
                fontSize: 8,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                bold: true,
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-table-mtom`,
                type: "rect",
                x: 10,
                y: 90,
                width: 91.27,
                height: 28,
                fill: "#AD6832",
                cornerRadius: 2.5
            },
            {
                id: `b${Date.now()}-boxTitleMoM`,
                type: "text",
                text: `Month-to-Month (M-to-M)`,
                x: 15,
                y: 94,
                fontSize: 6,
                italic: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-boxDescMoM`,
                type: "text",
                text: inflasiData?.dashboard?.now !== undefined
                    ? `${String(inflasiData.dashboard.now).replace(".", ",")}`
                    : `Inflasi XX`,
                x: 15,
                y: 102,
                fontSize: 12,
                bold: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-boxPercentageMoM`,
                type: "text",
                text: `%`,
                x: 75,
                y: 102,
                fontSize: 8,
                bold: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-table-ytd`,
                type: "rect",
                x: 104,
                y: 90,
                width: 91.27,
                height: 28,
                fill: "#F4913E",
                cornerRadius: 2.5
            },
            {
                id: `b${Date.now()}-boxTitleYtD`,
                type: "text",
                text: `Year-to-Date (Y-to-D)`,
                x: 109,
                y: 94,
                fontSize: 6,
                italic: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-boxDescYtD`,
                type: "text",
                text: inflasiData?.dashboard?.ytd !== undefined
                    ? `${String(inflasiData.dashboard.ytd).replace(".", ",")}`
                    : `Inflasi XX`,
                x: 109,
                y: 102,
                fontSize: 12,
                bold: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-boxPercentageYtD`,
                type: "text",
                text: `%`,
                x: 169,
                y: 102,
                fontSize: 8,
                bold: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-table-yoy`,
                type: "rect",
                x: 198.77,
                y: 90,
                width: 91.27,
                height: 28,
                fill: "#FEBD23",
                cornerRadius: 2.5
            },
            {
                id: `b${Date.now()}-boxTitleYoY`,
                type: "text",
                text: `Year-on-Year (Y-on-Y)`,
                x: 203.77,
                y: 94,
                fontSize: 6,
                italic: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-boxDescYoY`,
                type: "text",
                text: inflasiData?.dashboard?.yoy !== undefined
                    ? `${String(inflasiData.dashboard.yoy).replace(".", ",")}`
                    : `Inflasi XX`,
                x: 203.77,
                y: 102,
                fontSize: 12,
                bold: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-boxPercentageYoY`,
                type: "text",
                text: `%`,
                x: 263.77,
                y: 102,
                fontSize: 8,
                bold: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-bar-chart`,
                type: "chart",
                chartType: "bar",
                x: -3,
                y: 150,
                width: 150,
                height: 60,
                data: komoditasData?.top5Mom && komoditasData.top5Mom.length > 0
                    ? komoditasData.top5Mom
                    : [
                        { label: "Makanan", value: 3.2 },
                        { label: "Transportasi", value: 1.8 },
                        { label: "Kesehatan", value: 2.5 },
                        { label: "Pendidikan", value: 1.2 },
                        { label: "Rekreasi", value: 0.8 },
                    ],
                colors: ["#F69139"],
                showLabels: true,
                showValues: true,
                textColor: "#111827",
                fontSize: 6,
                chartPadding: 0,
                showAxes: true,
                gridColor: "rgba(0,0,0,0.15)",
                rotation: 0
            },
            {
                id: `b${Date.now()}-komoditasMoM`,
                type: "text",
                text: `Komoditas Penyumbang Utama\nAndil Inflasi (m-to-m,%)`,
                x: 30,
                y: 130,
                fontSize: 6,
                align: "center",
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#000000ff",
            },
            {
                id: `b${Date.now()}-bar-chart`,
                type: "chart",
                chartType: "bar",
                x: 145,
                y: 150,
                width: 150,
                height: 60,
                data: komoditasData?.top5Yoy && komoditasData.top5Yoy.length > 0
                    ? komoditasData.top5Yoy
                    : [
                        { label: "Makanan", value: 3.2 },
                        { label: "Transportasi", value: 1.8 },
                        { label: "Kesehatan", value: 2.5 },
                        { label: "Pendidikan", value: 1.2 },
                        { label: "Rekreasi", value: 0.8 },
                    ],
                colors: ["#FEBD23"],
                showLabels: true,
                showValues: true,
                textColor: "#111827",
                fontSize: 6,
                chartPadding: 0,
                showAxes: true,
                gridColor: "rgba(0,0,0,0.15)",
                rotation: 0
            },
            {
                id: `b${Date.now()}-komoditasYoY`,
                type: "text",
                text: `Komoditas Penyumbang Utama\nAndil Inflasi (y-o-y,%)`,
                x: 175,
                y: 130,
                fontSize: 6,
                align: "center",
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#000000ff",
            },
            {
                id: `b${Date.now()}-tingkat`,
                type: "text",
                text: `Tingkat Inflasi Month-to-Month (M-to-M) ${capitalize(locationName)} (2022=100), ${capitalize(month)} ${year - 1} - ${capitalize(month)} ${year}`,
                x: 20,
                y: 230,
                fontSize: 6,
                align: "center",
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#000000ff",
            },
            {
                id: `b${Date.now()}-bar-chart`,
                type: "chart",
                chartType: "line",
                x: -3,
                y: 240,
                width: 300,
                height: 60,
                data: inflasiData?.m2mLast13 && inflasiData.m2mLast13.length > 0
                    ? inflasiData.m2mLast13
                    : [
                        { label: "Bln 1", value: 3.2 },
                        { label: "Bln 2", value: 1.8 },
                        { label: "Bln 3", value: 2.5 },
                        { label: "Bln 4", value: 1.2 },
                        { label: "Bln 5", value: 0.8 },
                        { label: "Bln 6", value: 3.2 },
                        { label: "Bln 7", value: 1.8 },
                        { label: "Bln 8", value: 2.5 },
                        { label: "Bln 9", value: 1.2 },
                        { label: "Bln 10", value: 0.8 },
                        { label: "Bln 11", value: 3.2 },
                        { label: "Bln 12", value: 1.8 },
                        { label: "Bln 13", value: 1.8 },
                    ],
                colors: ["#F69139"],
                showLabels: true,
                showValues: true,
                textColor: "#111827",
                fontSize: 6,
                chartPadding: 8,
                showAxes: true,
                gridColor: "rgba(0,0,0,0.15)",
                rotation: 0
            },
            {
                id: `b${Date.now()}-dashed-divider`,
                type: "line",
                points: [10, 220, 290, 220],
                stroke: "#000000ff",
                strokeWidth: 1.5,
                dash: [6, 4],
            },
            {
                id: `b${Date.now()}-dashed-divider2`,
                type: "line",
                points: [10, 303, 290, 303],
                stroke: "#000000ff",
                strokeWidth: 1.5,
                dash: [6, 4],
            },
            {
                id: `b${Date.now()}-summary`,
                type: "text",
                text: `${summary ? summary?.summary : "isi AI summary inflasi disini"}`,
                x: 10,
                y: 315,
                width: 280,
                fontSize: 6,
                align: "left",
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#000000ff",
            },
        ],
    },
]


function KonvaImg({ el }) {
    const [img, setImg] = useState(null);

    useEffect(() => {
        if (!el?.src) return;
        const image = new window.Image();
        image.crossOrigin = "anonymous";
        image.src = window.location.origin + el.src;

        image.onload = () => {
            setImg(image);
        };
    }, [el?.src]);

    return img ? <KonvaImage image={img} {...el} /> : null;
}


export default function BannerList({ setPagesWithHistory }) {
    const dispatch = useDispatch();
    const { activeIndex } = useSelector((state) => state?.editor ?? {});
    const stageRefs = useRef([]);
    const [thumbs, setThumbs] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (!banners?.length) return;
        setLoading(false);
        const timeout = setTimeout(() => {
            const previews = banners.map((bnr, i) =>
                stageRefs.current[i]?.toDataURL({ pixelRatio: 2 })
            );
            setThumbs(previews.map((url, i) => ({ url, banner: banners[i] })));
            setLoading(true);
        }, 200); // wait for images to load

        return () => clearTimeout(timeout);
    }, [banners]);




    const applyTemplate = (template) => {
        if (!template) return;
        setPagesWithHistory((prev) => {
            const cp = JSON.parse(JSON.stringify(prev));
            const children = (template?.children || []).map((el, idx) => ({
                ...el,
                id: `${el?.id}-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`
            }));
            cp[activeIndex] = { ...(cp[activeIndex] || {}), children, background: template?.background };
            return cp;
        });
        // Sesuaikan ukuran kanvas dengan ukuran template
        if (template?.w && template?.h) {
            dispatch(setCanvasSize({ w: template.w, h: template.h }));
        }
        dispatch(setSelectedUniqueId(null));
        dispatch(setPopUp(false));
    };

    return (
        <>
            <div style={{ display: "none" }}>
                {banners?.map((bnr, i) => (
                    <Stage
                        key={i}
                        width={bnr.w || 900}
                        height={bnr.h || 500}
                        ref={(el) => (stageRefs.current[i] = el)}
                    >
                        <Layer>
                            {bnr?.children.map((el) => {
                                return (
                                    <React.Fragment key={el.id}>
                                        {el.type === "rect" ? (
                                            <Rect {...el} />
                                        ) : el.type === "text" ? (
                                            <Text {...el} />
                                        ) : el.type === "image" ? (
                                            <KonvaImg el={el} />
                                        ) : el.type === "chart" ? (
                                            <SelectableChart shape={el} selected={false} />
                                        ) : null}
                                    </React.Fragment>
                                )
                            }

                            )}
                        </Layer>
                    </Stage>
                ))}
            </div>
            {loading ? (
                <Row gutter={[0, 20]}>
                    {thumbs.map((t, i) => (
                        <Col key={i} span={24} onClick={() => applyTemplate(t.banner)}>
                            <Image
                                src={t.url}
                                alt={t.banner.name}
                                preview={false}
                                width={"100%"}
                                style={{ objectFit: "cover", cursor: "pointer", maxHeight: "150px" }}
                            />
                        </Col>
                    ))}
                </Row>
            ) : (
                <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
                        <Space>
                            <Skeleton.Avatar active size="large" shape="square" />
                            <Skeleton.Button active size={'default'} shape={'circle'} block={true} />
                        </Space>
                        <Skeleton.Input active size={'default'} block={true} />
                        <Space>
                            <Skeleton.Button active />
                            <Skeleton.Avatar active />
                            <Skeleton.Input active size="small" />
                        </Space>

                    </div>
                </>
            )
            }
        </>
    );
}