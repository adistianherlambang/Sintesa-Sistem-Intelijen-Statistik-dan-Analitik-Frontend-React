import React from 'react'
import styles from "./Overview.module.css"

//component
import Graph from '../../../components/FromPage/Overview/Graph'
import Wrapper from '../../../components/Wrapper/Wrapper'
import { LiquidGlass } from '@liquidglass/react';

//kpi
import Inflasi from '../../../components/FromPage/Overview/KPI/Inflasi'
import KomoditasDom from '../../../components/FromPage/Overview/KPI/KomoditasDom'
import IHK from '../../../components/FromPage/Overview/KPI/IHK'
import UserActivity from '../../../components/FromPage/Overview/UserActivity'
import AISummary from '../../../components/FromPage/Overview/AISummary'
import HitoriAnalisis from '../../../components/FromPage/Overview/HitoriAnalisis'
import HistoriInfografis from '../../../components/FromPage/Overview/HistoriInfografis'
import { BotStatusOverview, BotKnowledgeOverview } from '../../../components/FromPage/Overview/BotOverview'

export default function Overview() {
  return (
    <>
      <div className={styles.container}>
        <p className={styles.tabTitle}>Overview</p>

        <div className={styles.containerr}>
          <div className={styles.wrapper}>
            <p className={styles.sectionTitle}>KPI Utama <i>(BPS Indicator)</i></p>
            <div className={styles.section}>
              <Wrapper><div className={styles.kpiUtama}><Inflasi onLoad={() => { }} /></div></Wrapper>
              <Wrapper><div className={styles.kpiUtama}><IHK onLoad={() => { }} /></div></Wrapper>
              <Wrapper><div className={styles.kpiUtama}><KomoditasDom onLoad={() => { }} /></div></Wrapper>
            </div>
          </div>

          <div className={styles.wrapper}>
            <div className={styles.section}>
              <Wrapper width="50%" padding="0"><Graph onLoad={() => { }} /></Wrapper>
              <div className={styles.wrapper}>
                <Wrapper><BotStatusOverview /></Wrapper>
                <Wrapper><BotKnowledgeOverview /></Wrapper>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.containerr}>
          <div className={styles.section}>
            <Wrapper><UserActivity /></Wrapper>
            <Wrapper padding="0"><AISummary /></Wrapper>
          </div>
        </div>

        <div className={styles.containerr}>
          <div className={styles.section}>
            <Wrapper><HitoriAnalisis /></Wrapper>
          </div>
        </div>

        <div className={styles.containerr}>
          <div className={styles.section}>
            <Wrapper><HistoriInfografis /></Wrapper>
          </div>
        </div>

      </div>

      {/* <MainButton>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.77778 11.1111V6.94444H9.72222V11.1111H11.1111V3.35278L9.14722 1.38889H1.38889V11.1111H2.77778ZM0.694444 0H9.72222L12.5 2.77778V11.8056C12.5 11.9897 12.4268 12.1664 12.2966 12.2966C12.1664 12.4268 11.9897 12.5 11.8056 12.5H0.694444C0.510266 12.5 0.333632 12.4268 0.203398 12.2966C0.0731644 12.1664 0 11.9897 0 11.8056V0.694444C0 0.510266 0.0731644 0.333632 0.203398 0.203398C0.333632 0.0731644 0.510266 0 0.694444 0ZM4.16667 8.33333V11.1111H8.33333V8.33333H4.16667Z" fill="white"/>
      </svg>
      <p>Simpan</p>
    </MainButton> */}
    </>
  )
}