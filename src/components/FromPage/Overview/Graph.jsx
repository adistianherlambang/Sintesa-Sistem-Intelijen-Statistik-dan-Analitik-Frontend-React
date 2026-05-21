import React from 'react'
import { useState, useEffect } from 'react'
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import Skeleton from '../../../components/Skeleton/Skeleton'
import axios from 'axios';

export default function Graph({onLoad}) {
    const [tren, setTren] = useState({})
    const [load, setLoad] = useState(true)
    const [gagal, setGagal] = useState(false)
  
    useEffect(() => {
      const getData = async () => {
        try {
          setGagal(false)
          setLoad(true)

          const response = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi`, 
            {
              kota: "KOTA METRO"
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
    <div style={{

    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        padding: "1rem",
        gap: "4px",
        width: 'fit-content'
      }}>
        <p style={{color: "#AAAAAA"}}>Grafik Inflasi {year}</p>
        <div style={{
          width: 'fit-content',
          display: "flex", 
          flexDirection: "column",
          alignItems: "end",
        }}>
          <p style={{fontSize: "24px"}}>Month to Month</p>
          <i style={{color: "#AAAAAA"}}>{month[data.length - 1]}</i>
        </div>
      </div>
      <div style={{ width: "100%", height: "10rem", pointerEvents: "none" }}>
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
                  stopColor="#13653F"
                />

                <stop
                  offset="100%"
                  stopColor="#26CB7F"
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
              stroke="#26CB7F"
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
