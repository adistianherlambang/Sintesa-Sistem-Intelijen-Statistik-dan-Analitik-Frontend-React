import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Inflasi({onLoad}) {

  const [data, setData] = useState(0)
  const [load, setLoad] = useState(true)
  const [gagal, setGagal] = useState(false)

  useEffect(() => {
    const getData = async () => {
      try {

        const res = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/ihk`, 
          {
            kota: "KOTA METRO"
          },
        )

        setData(res)
        
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

  const now = data?.data?.dashboard?.now
  const compare = data?.data?.dashboard?.compare

  return (
    <div>IHK {now} || selisih: {compare}</div>
  )

  // return(
  //   <pre>{JSON.stringify(data.data, null, 2)}</pre>
  // )
}
