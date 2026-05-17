import React from 'react'

export default function NavDesktop() {
  return (
    <div className={styles.left}>
      <Logo/>
      <div>
        <p>DASHBOARD</p>
        <div className={styles.leftWrapper}>
          <NavButton keyword="overview"/>
        </div>
      </div>
      <div>
        <p>WORKSPACE</p>
        <div className={styles.leftWrapper}>
          <NavButton keyword="analisis" tab="workspace" />
          <NavButton keyword="histori" tab="workspace"/>
        </div>
      </div>
      <div>
        <p>INFOGRAFIS</p>
        <div className={styles.leftWrapper}>
          <NavButton keyword="buatInfografis" tab="infografis" />
          <NavButton keyword="histori" tab="infografis"/>
        </div>
      </div>
      <div>
        <p>BOT WHATSAPP</p>
        <div className={styles.leftWrapper}>
          <NavButton keyword="sambungkanAkun" tab="bot" />
          <NavButton keyword="botKnowledge" tab="bot"/>
        </div>
      </div>
      <div>
        <p>INFORMASI AKUN</p>
        <div className={styles.leftWrapper}>
          <NavButton keyword="tentangAkun" tab="akun" />
          <NavButton keyword="langgananDanBilling" tab="akun"/>
        </div>
      </div>
    </div>
  )
}
