import React from 'react'
import { useState, useEffect } from 'react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Skeleton from '../../../components/Skeleton/Skeleton'
import axios from 'axios';
import styles from "./Graph.module.css";
import { userStore } from "../../../logic/state/store"

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>Bulan: {label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className={styles.tooltipItem}>
            <span style={{ color: entry.color, fontWeight: 600 }}>{entry.name}:</span>
            <span style={{ fontWeight: 'bold' }}>{Number(entry.value).toFixed(2)}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function Graph({ onLoad }) {
  const [tren, setTren] = useState({})
  const [load, setLoad] = useState(true)
  const [gagal, setGagal] = useState(false)
  const [yoy, setYoy] = useState({})
  const [ytd, setYtd] = useState({})

  const user = userStore((state) => state.user)

  useEffect(() => {
    const getData = async () => {
      try {
        setGagal(false)
        setLoad(true)

        const userCity = user?.location?.name || "KOTA METRO"
        const response = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi`,
          { kota: userCity }
        )
        setTren(response.data)

        const responseYoy = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi/yoy`,
          { kota: userCity }
        )
        setYoy(responseYoy.data)

        const responseYtd = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi/ytd`,
          { kota: userCity }
        )
        setYtd(responseYtd.data)

      } catch (err) {
        console.error(err.message);
        setGagal(true)
      } finally {
        setLoad(false)
        if (typeof onLoad === 'function') onLoad()
      }
    };
    getData();
  }, []);

  const monthShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

  const data = tren?.data?.map((item, index) => ({
    x: index + 1,
    label: item?.label || monthShort[index % 12] || `${index + 1}`,
    y: parseFloat(item?.value || 0),
    yoy: parseFloat(yoy?.data?.[index]?.value || 0),
    ytd: parseFloat(ytd?.data?.[index]?.value || 0)
  })) || []

  const date = new Date()
  const year = date.getFullYear()

  const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

  if (load) {
    return <Skeleton height="280px" />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.subtitle}>Grafik Inflasi <i className={styles.monthInfo}>{month[data.length - 1]}</i> {year}</p>
        <div className={styles.legendContainer}>
          <div className={styles.legendItem}>
            <span className={styles.dotMom} />
            <span>MoM</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.dotYoy} />
            <span>YoY</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.dotYtd} />
            <span>YtD</span>
          </div>
        </div>
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0
            }}
          >
            <defs>
              <linearGradient id="gradientMom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb3131ff" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#71111100" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientYoy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34B34A" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#34B34A00" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientYtd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F0B244" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#F0B24400" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeWidth={0.5} />
            <XAxis dataKey="label" axisLine={{ stroke: 'rgba(255, 255, 255, 0.15)', strokeWidth: 0.5 }} tickLine={false} tick={{ fill: '#AAAAAA', fontSize: 8 }} />
            <YAxis axisLine={{ stroke: 'rgba(255, 255, 255, 0.15)', strokeWidth: 0.5 }} tickLine={false} tick={{ fill: '#AAAAAA', fontSize: 8 }} domain={['auto', 'auto']} unit="%" />
            <Tooltip content={<CustomTooltip />} />

            {/* MoM (Month to Month) */}
            <Area
              type="monotone"
              dataKey="y"
              name="MoM"
              stroke="#fb3131ff"
              fill="url(#gradientMom)"
              strokeWidth={1.5}
            />

            {/* YoY (Year on Year) */}
            <Area
              type="monotone"
              dataKey="yoy"
              name="YoY"
              stroke="#34B34A"
              fill="url(#gradientYoy)"
              strokeWidth={1.5}
            />

            {/* YtD (Year to Date) */}
            <Area
              type="monotone"
              dataKey="ytd"
              name="YtD"
              stroke="#F0B244"
              fill="url(#gradientYtd)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
