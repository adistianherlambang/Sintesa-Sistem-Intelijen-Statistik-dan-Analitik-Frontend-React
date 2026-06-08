import React from 'react'
import { useState, useEffect } from 'react'
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import Skeleton from '../../../components/Skeleton/Skeleton'
import axios from 'axios';
import styles from "./Graph.module.css";
import { userStore } from "../../../logic/state/store"

export default function Graph({ onLoad }) {
  const [tren, setTren] = useState({})
  const [load, setLoad] = useState(true)
  const [gagal, setGagal] = useState(false)
  const user = userStore((state) => state.user)

  useEffect(() => {
    const getData = async () => {
      try {
        setGagal(false)
        setLoad(true)

        const userCity = user?.location?.name || "KOTA METRO"
        const response = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi`,
          {
            kota: userCity
          },
        )

        setTren(response.data)

      } catch (err) {
        console.error(err.message);
        setGagal(true)
      } finally {
        setLoad(false)
        onLoad()
      }
    };
    getData();
  }, []);

  // let data = Object.values(tren.dashboard).map((item))

  // if(!load && tren?.datacontent) {
  //   data = Object.values(tren.datacontent).map((item, index) => ({
  //     x: index + 1,
  //     y: item
  //   }));
  // }

  const data = tren?.data?.map((item, index) => ({
    x: index + 1,
    y: item.value
  })) || []

  const date = new Date()
  const year = date.getFullYear()

  const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

  return (
    <>
      {!load &&
        <div className={styles.container}>
          <div className={styles.header}>
            <p className={styles.subtitle}>Grafik Inflasi {year}</p>
            <div className={styles.titleBlock}>
              <p className={styles.title}>Month to Month</p>
              <i className={styles.monthInfo}>{month[data.length - 1]}</i>
            </div>
          </div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer>
              <AreaChart
                data={data}
                margin={{
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0
                }}
              >
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#ff0000ff"
                    />

                    <stop
                      offset="100%"
                      stopColor="#711111ff"
                    />
                  </linearGradient>
                </defs>

                <YAxis
                  hide
                  domain={['dataMin', 'dataMax']}
                />
                <Area
                  type="linear"
                  dataKey="y"
                  stroke="#fb3131ff"
                  fill="url(#gradient)"
                  strokeWidth={1}
                  baseValue="dataMin"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      }
    </>
  )
}
