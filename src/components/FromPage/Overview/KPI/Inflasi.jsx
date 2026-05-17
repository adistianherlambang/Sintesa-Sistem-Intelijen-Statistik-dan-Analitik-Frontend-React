import React from 'react'
import { useState, useEffect } from 'react'

export default function Inflasi({onLoad}) {

  const [data, setData] = useState(0)
  const [beda, setBeda] = useState(0)
  const [load, setLoad] = useState(true)
  const [gagal, setGagal] = useState(false)

  useEffect(() => {
    const getData = async () => {
      try {

        let response
        const time = 5

        for (let i = 0; i <= time; i++) {
          response = await fetch("http://localhost:5000/api/dashboard/overview/inflasi", {method: "POST"})
          if(!response.ok) {
            await new Promise(r => setTimeout(r, 1000))
            continue
          } else {
            break
          }
        }

        if (!response || !response.ok) {
          throw new Error("Request timeout");
        }

        const json = await response.json()
        const dataContent = Object.values(json.datacontent)
        if (dataContent.length > 1) {
          const selisih = dataContent[dataContent.length - 1] - dataContent[dataContent.length - 2]

          setBeda(selisih.toFixed(2))
          setData(dataContent[dataContent.length - 1])
        } else {
          setBeda(0)
          setData(dataContent[0])
        }

        console.log(dataContent)

      } catch(err) {
        console.error(err.message)
      } finally {
        setLoad(false)
        onLoad()
        console.log()
      }
    }

    getData()
  }, [])

  return (
    <div>{data} || selisih: {beda}</div>
  )
}
