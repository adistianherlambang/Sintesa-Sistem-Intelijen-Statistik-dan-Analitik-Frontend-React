import React from 'react'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import MainButton from '../../../components/Button/MainButton/MainButton'
import axios from 'axios'


//components
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import Skeleton from '../../../components/Skeleton/Skeleton'

export default function Overview() {

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
            continue
          } else {
            break
          }

          await new Promise(r => setTimeout(r, time*1000))
        }
        
        const json = await response.json()
        setTren(json);
        console.log(json)
      } catch (err) {
        console.error(err.message);
        setGagal(true)
      } finally {
        setLoad(false)
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
    <Skeleton/>
    {load ? "bentar" : gagal ? "gagal" : `${month[Object.keys(tren.datacontent).length - 1]} || ${Object.keys(tren.datacontent).length}`}
     {load ? "bentar" : gagal ? "gagal" :
      <div style={{ width: "100%", height: 300, pointerEvents: "none" }}>
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
    <MainButton>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.77778 11.1111V6.94444H9.72222V11.1111H11.1111V3.35278L9.14722 1.38889H1.38889V11.1111H2.77778ZM0.694444 0H9.72222L12.5 2.77778V11.8056C12.5 11.9897 12.4268 12.1664 12.2966 12.2966C12.1664 12.4268 11.9897 12.5 11.8056 12.5H0.694444C0.510266 12.5 0.333632 12.4268 0.203398 12.2966C0.0731644 12.1664 0 11.9897 0 11.8056V0.694444C0 0.510266 0.0731644 0.333632 0.203398 0.203398C0.333632 0.0731644 0.510266 0 0.694444 0ZM4.16667 8.33333V11.1111H8.33333V8.33333H4.16667Z" fill="white"/>
      </svg>
      <p>Simpan</p>
    </MainButton>
    </>
  )
}