import React from 'react'
import { useState, useEffect } from 'react'
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import Skeleton from '../../../components/Skeleton/Skeleton'

export default function Graph({onLoad}) {
    const [tren, setTren] = useState({})
    const [load, setLoad] = useState(true)
    const [gagal, setGagal] = useState(false)
  
    useEffect(() => {
      const getData = async () => {
        try {
          setGagal(false)
          setLoad(true)
  
          let response
          const time = 5 //5 kali percobaan setiap 1 detik
  
          for (let i = 0; i<=time; i++) {
            response = await fetch("http://localhost:5000/test", {method: "POST"})
            if(!response.ok) {
              await new Promise(r => setTimeout(r, time*1000))
              continue
            } else {
              break
            }
          }
          
          const json = await response.json()
          setTren(json);
          console.log(json)
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
  
    let data = [0]
  
    if(!load && tren?.datacontent) {
      data = Object.values(tren.datacontent).map((item, index) => ({
        x: index + 1,
        y: item
      }));
    }
  
    const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
  
  return (
    <>
    {load ? "bentar" : gagal ? "gagal" : `${month[Object.keys(tren.datacontent).length - 1]} || ${Object.keys(tren.datacontent).length}`}
    {load ? "bentar" : gagal ? "gagal" :
    <div style={{ width: "100%", height: "300px", pointerEvents: "none" }}>
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
    }
    </>
  )
}
