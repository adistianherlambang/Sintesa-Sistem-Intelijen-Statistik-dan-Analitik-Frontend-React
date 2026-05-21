import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function KomoditasDom(onLoad) {

  const [data, setData] = useState()
  const [load, setLoad] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {

        const res = axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/komoditas`, 
          {
            kota: "KOTA METRO"
          }
        )

        setData(res.data)

        console.log(res.data)

      } catch(err) {
        console.log(err.message)
      } finally {
        onLoad()
        setLoad(true)
      }
    }
  })

  return (
    <>
    <pre>{JSON.stringify(data, null, 2)}</pre>
    {data?.biggest?.value}
    </>
  )
}
