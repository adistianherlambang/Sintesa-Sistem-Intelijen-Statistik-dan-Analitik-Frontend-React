import React from 'react'
import { useState, useEffect } from 'react'
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import Skeleton from '../../../components/Skeleton/Skeleton'

export default function Graph() {
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
    </>
  )
}
