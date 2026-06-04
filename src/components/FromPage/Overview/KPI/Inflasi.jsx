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

        const res = await axios.post(`${process.env.REACT_APP_URL_SERVER}/api/dashboard/overview/inflasi`, 
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
      }
    }

    getData()
  }, [])

  const now = data?.data?.dashboard?.now
  const compare = data?.data?.dashboard?.compare
  const then = data?.data?.dashboard?.then

  return (
    <div style={{
      lineHeight: 0
    }}>
      <p>Inflasi MoM</p>
      <h1>{now}%</h1>
      {!compare > 0 ?
        <div style={{display: "flex", gap: 8, alignItems: "center"}}>
          <svg width="9" height="10" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.48993 8.85027L8.13993 4.40027C8.16993 4.20027 8.11993 4.00027 7.99993 3.84027C7.87993 3.68027 7.69993 3.57027 7.49993 3.54027C7.29993 3.51027 7.10993 3.56027 6.94993 3.68027C6.78993 3.80027 6.67993 3.98027 6.64993 4.18027L6.26993 6.84027L1.34993 0.300273C1.10993 -0.0297275 0.649933 -0.0997275 0.289933 0.150273C0.0999336 0.300273 -6.77336e-05 0.520272 -6.77437e-05 0.750273C-6.77507e-05 0.910272 0.0499334 1.06027 0.149933 1.20027L5.05993 7.75027L2.39993 7.37027C2.19993 7.34027 1.99993 7.39027 1.83993 7.52027C1.67993 7.64027 1.57993 7.82027 1.55993 8.01027C1.52993 8.20027 1.57993 8.40027 1.69993 8.56027C1.81993 8.72027 1.98993 8.82027 2.18993 8.85027L6.63993 9.49027C7.05993 9.55027 7.42993 9.27027 7.48993 8.85027Z" fill="#4ABB53"/>
          </svg>
          <p><span style={{color: "#4ABB53"}}>{compare}</span> vs last month</p>
        </div>
        :
        <div style={{display: "flex", gap: 8, alignItems: "center"}}>
          <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.85027 0.658505L4.40027 0.0085046C4.20027 -0.0214954 4.00027 0.0285046 3.84027 0.148505C3.68027 0.268505 3.57027 0.448505 3.54027 0.648505C3.51027 0.848505 3.56027 1.0385 3.68027 1.1985C3.80027 1.3585 3.98027 1.4685 4.18027 1.4985L6.84027 1.8785L0.300273 6.7985C-0.0297272 7.0385 -0.0997272 7.4985 0.150273 7.8585C0.300273 8.0485 0.520273 8.14851 0.750273 8.14851C0.910273 8.14851 1.06027 8.0985 1.20027 7.9985L7.75027 3.0885L7.37027 5.7485C7.34027 5.9485 7.39027 6.1485 7.52027 6.3085C7.64027 6.4685 7.82027 6.5685 8.01027 6.5885C8.20027 6.6185 8.40027 6.5685 8.56027 6.4485C8.72027 6.3285 8.82027 6.1585 8.85027 5.9585L9.49027 1.5085C9.55027 1.0885 9.27027 0.718505 8.85027 0.658505Z" fill="#D52B2B"/>
          </svg>
          <p><span style={{color: "#D52B2B"}}>{compare}</span> vs last month</p>
        </div>
      }
    </div>
  )

  // return(
  //   <pre>{JSON.stringify(data.data, null, 2)}</pre>
  // )
}
