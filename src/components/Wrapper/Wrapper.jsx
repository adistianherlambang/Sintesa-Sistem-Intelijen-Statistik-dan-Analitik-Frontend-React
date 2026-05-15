import React from 'react'

export default function Wrapper({width, height, children}) {
  return (
    <div>{children}</div>
  )
}

//width & height isi fill atau angka spesifik misal width={12rem} atau width={fill}