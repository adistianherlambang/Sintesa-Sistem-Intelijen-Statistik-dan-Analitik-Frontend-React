import React from 'react'
import styles from "./NavButton.module.css"
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

//icon
import {
  OverviewIcon,
  AnalisisIcon,
  HistoriIcon,
  BuatInfografisIcon,
  SambungkanAkunIcon,
  BotKnowledgeIcon,
  TentangAkunIcon,
  LanggananBillingIcon,
  LogoutIcon
} from "../../Icon/Icon";

export default function NavButton({ keyword, tab, onClick }) {

  const navigate = useNavigate();
  const location = useLocation()

  const [active, setActive] = useState(false)

  useEffect(() => {
    if (location.pathname == "/dashboard") {

    }
  }, [])

  const arr = {
    overview: OverviewIcon,
    analisis: AnalisisIcon,
    histori: HistoriIcon,
    buatInfografis: BuatInfografisIcon,
    sambungkanAkun: SambungkanAkunIcon,
    botKnowledge: BotKnowledgeIcon,
    tentangAkun: TentangAkunIcon,
    langgananDanBilling: LanggananBillingIcon,
    logout: LogoutIcon
  };

  const IconComponent = arr[keyword];

  const capitalize = (str) => {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .trim();
  };

  const perSlash = location.pathname.split("/").filter(Boolean)

  const currentTab = perSlash[1]
  const currentKeyword = perSlash[2]

  const isActive =
    (location.pathname == "/dashboard" && keyword == "overview") ||
    (currentTab === tab && currentKeyword === keyword);

  const handleClick = () => {
    if (keyword == "overview") {
      navigate(`/dashboard`)
    } else {
      navigate(`/dashboard/${tab}/${keyword}`)
    }
  }

  return (
    <div
      className={`${styles.container} ${isActive ? styles.active : ""}`}
      onClick={onClick ? onClick : handleClick}
    >
      <div className={`${styles.icon} ${isActive ? styles.iconActive : ""}`}>{IconComponent && <IconComponent />}</div>
      <div>{capitalize(keyword)}</div>
    </div>
  );
}