
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

const getInflasiYoy = async () => {
    try {
        const res = await axios.post(
            `${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi/yoy`,
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

const inflasiYoyData = await getInflasiYoy();

const listMonth = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
];

const isValValid = (v) => v !== undefined && v !== null && v !== "" && !Number.isNaN(Number(v));

const dummy = listMonth
    .map((month, i) => {
        const yoy2Val = inflasiYoyData?.prev2Year?.[i]?.value;
        const yoyVal = inflasiYoyData?.prevYear?.[i]?.value;
        const nowVal = inflasiYoyData?.data?.[i]?.value;

        const values = [];
        if (isValValid(yoy2Val)) values.push(Number(yoy2Val));
        if (isValValid(yoyVal)) values.push(Number(yoyVal));
        if (isValValid(nowVal)) values.push(Number(nowVal));

        if (values.length === 0) return null;

        return {
            label: String(month),
            values,
        };
    })
    .filter(Boolean);

const banners = [
    {
        name: `Infografis ${locationName} ${month} ${year}`,
        type: "banner",
        w: 1200,
        h: 1700,
        x: 0,
        y: 0,
        children: [
            {
                id: `b${Date.now()}-bg-photo`,
                type: "image",
                x: 0,
                y: 0,
                width: 1200,
                height: 1700,
                src: infografisBackground,
            },
            {
                id: `b${Date.now()}-footer-photo`,
                type: "image",
                x: 0,
                y: 1524,
                width: 1200,
                height: 178,
                src: infografisFooter,
            },
            {
                id: `b${Date.now()}-footer-text`,
                type: "text",
                text: `BADAN PUSAT STATISTIK\n${locationName.toUpperCase()}\nhttps://website.bps.go.id`,
                x: 956,
                y: 1620,
                fontSize: 16.4,
                fontFamily: "Montserrat",
                italic: true,
                bold: true,
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-title-text`,
                type: "text",
                text: `PERKEMBANGAN\nINDEKS HARGA KONSUMEN\n${locationName.toUpperCase()} ${month.toUpperCase()} ${year}`,
                x: 40,
                y: 80,
                fontSize: 60,
                fontFamily: "Montserrat",
                fontStyle: "bold",
                bold: true,
                fill: "#AD6832",
            },
            {
                id: `b${Date.now()}-brs-no`,
                type: "text",
                text: `Berita Resmi Statistik No. `,
                x: 40,
                y: 280,
                fontSize: 32,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                bold: true,
                fill: "#000000ff",
            },
            {
                id: `b${Date.now()}-qr`,
                type: "rect",
                x: 960,
                y: 80,
                width: 200,
                height: 200,
                fill: "#000000ff",
            },
            {
                id: `b${Date.now()}-qr-text`,
                type: "text",
                text: `QR Code`,
                x: 988,
                y: 160,
                fontSize: 32,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                bold: true,
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-table-mtom`,
                type: "rect",
                x: 40,
                y: 360,
                width: 365.08,
                height: 112,
                fill: "#AD6832",
                cornerRadius: 10
            },
            {
                id: `b${Date.now()}-boxTitleMoM`,
                type: "text",
                text: `Month-to-Month (M-to-M)`,
                x: 60,
                y: 376,
                fontSize: 24,
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
                x: 60,
                y: 408,
                fontSize: 48,
                bold: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-boxPercentageMoM`,
                type: "text",
                text: `%`,
                x: 300,
                y: 408,
                fontSize: 32,
                bold: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-table-ytd`,
                type: "rect",
                x: 416,
                y: 360,
                width: 365.08,
                height: 112,
                fill: "#F4913E",
                cornerRadius: 10
            },
            {
                id: `b${Date.now()}-boxTitleYtD`,
                type: "text",
                text: `Year-to-Date (Y-to-D)`,
                x: 436,
                y: 376,
                fontSize: 24,
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
                x: 436,
                y: 408,
                fontSize: 48,
                bold: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-boxPercentageYtD`,
                type: "text",
                text: `%`,
                x: 676,
                y: 408,
                fontSize: 32,
                bold: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-table-yoy`,
                type: "rect",
                x: 795.08,
                y: 360,
                width: 365.08,
                height: 112,
                fill: "#FEBD23",
                cornerRadius: 10
            },
            {
                id: `b${Date.now()}-boxTitleYoY`,
                type: "text",
                text: `Year-on-Year (Y-on-Y)`,
                x: 815.08,
                y: 376,
                fontSize: 24,
                italic: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-boxDescYoY`,
                type: "text",
                text: (inflasiData?.dashboard?.yoy ?? inflasiData?.dashboard?.prevYear) !== undefined
                    ? `${String(inflasiData?.dashboard?.yoy ?? inflasiData?.dashboard?.prevYear).replace(".", ",")}`
                    : `Inflasi XX`,
                x: 815.08,
                y: 408,
                fontSize: 48,
                bold: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-boxPercentageYoY`,
                type: "text",
                text: `%`,
                x: 1055.08,
                y: 408,
                fontSize: 32,
                bold: true,
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#ffffffff",
            },
            {
                id: `b${Date.now()}-bar-chart`,
                type: "chart",
                chartType: "bar",
                x: 10,
                y: 600,
                width: 590,
                height: 240,
                data: (komoditasData?.topSubMom && komoditasData.topSubMom.length > 0)
                    ? komoditasData.topSubMom
                    : (komoditasData?.topsubmom && komoditasData.topsubmom.length > 0)
                        ? komoditasData.topsubmom
                        : (komoditasData?.top5Mom && komoditasData.top5Mom.length > 0)
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
                fontSize: 14,
                chartPadding: 0,
                showAxes: false,
                gridColor: "rgba(0,0,0,0.15)",
                rotation: 0
            },
            {
                id: `b${Date.now()}-komoditasMoM`,
                type: "text",
                text: `Komoditas Penyumbang Utama\nAndil Inflasi (m-to-m,%)`,
                x: 120,
                y: 520,
                fontSize: 24,
                align: "center",
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#000000ff",
            },
            {
                id: `b${Date.now()}-bar-chart`,
                type: "chart",
                chartType: "bar",
                x: 600,
                y: 600,
                width: 590,
                height: 240,
                data: (komoditasData?.topSubYoy && komoditasData.topSubYoy.length > 0)
                    ? komoditasData.topSubYoy
                    : (komoditasData?.topsubyoy && komoditasData.topsubyoy.length > 0)
                        ? komoditasData.topsubyoy
                        : (komoditasData?.top5Yoy && komoditasData.top5Yoy.length > 0)
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
                fontSize: 14,
                chartPadding: 0,
                showAxes: false,
                gridColor: "rgba(0,0,0,0.15)",
                rotation: 0
            },
            {
                id: `b${Date.now()}-komoditasYoY`,
                type: "text",
                text: `Komoditas Penyumbang Utama\nAndil Inflasi (y-o-y,%)`,
                x: 700,
                y: 520,
                fontSize: 24,
                align: "center",
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#000000ff",
            },
            {
                id: `b${Date.now()}-tingkat`,
                type: "text",
                text: `Tingkat Inflasi Month-to-Month (M-to-M) ${capitalize(locationName)} (2022=100), ${capitalize(month)} ${year - 1} - ${capitalize(month)} ${year}`,
                x: 80,
                y: 940,
                fontSize: 24,
                align: "center",
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#000000ff",
            },
            {
                id: `b${Date.now()}-bar-chart`,
                type: "chart",
                chartType: "line",
                x: 40,
                y: 960,
                width: 1130,
                height: 240,
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
                fontSize: 24,
                chartPadding: 32,
                showAxes: false,
                gridColor: "rgba(0,0,0,0.15)",
                rotation: 0
            },
            {
                id: `b${Date.now()}-dashed-divider`,
                type: "line",
                points: [40, 900, 1160, 900],
                stroke: "#000000ff",
                strokeWidth: 2,
                dash: [4, 8],
            },
            {
                id: `b${Date.now()}-dashed-divider2`,
                type: "line",
                points: [40, 1212, 1160, 1212],
                stroke: "#000000ff",
                strokeWidth: 2,
                dash: [4, 8],
            },
            {
                id: `b${Date.now()}-summary`,
                type: "text",
                text: `${summary ? summary?.summary : "isi AI summary inflasi disini"}`,
                x: 40,
                y: 1260,
                width: 1120,
                fontSize: 24,
                align: "left",
                fontFamily: "Montserrat",
                fontStyle: "normal",
                fill: "#000000ff",
            },
        ],
    },
    {
        name: `blank`,
        type: "banner",
        w: 1200,
        h: 1700,
        x: 0,
        y: 0,
        background: "#ffffff",
        children: []
    },
    {
        name: `Grouped Chart Banner`,
        type: "banner",
        w: 669,
        h: 370,
        x: 0,
        y: 0,
        background: "#ffffff",
        children: [
            {
                id: `b${Date.now()}-grouped-chart`,
                type: "chart",
                chartType: "groupedBar",
                x: 0,
                y: 0,
                width: 669,
                height: 370,
                data: dummy,
                seriesNames: [String(year - 2), String(year - 1), String(year)],
                colors: ["#AD6832", "#F4913E", "#FEBD23"],
                showLabels: true,
                showValues: true,
                textColor: "#111827",
                fontSize: 14,
                chartPadding: 20,
                showAxes: false,
                gridColor: "rgba(0,0,0,0.15)",
                rotation: 0
            }
        ]
    }
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
                            <Rect
                                x={0}
                                y={0}
                                width={bnr.w || 900}
                                height={bnr.h || 500}
                                fill={bnr.background || "#ffffff"}
                            />
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