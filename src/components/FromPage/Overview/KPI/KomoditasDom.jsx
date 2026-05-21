import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function KomoditasDom() {

  const [data, setData] = useState()

  useEffect(() => {
    const getData = async () => {
      try {

        const res = axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/komoditas`, 
          {
            kota: "KOTA METRO"
          }
        )

        setData(res.data)

      } catch(err) {
        console.log(err.message)
      }
    }
  })

  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )
}
