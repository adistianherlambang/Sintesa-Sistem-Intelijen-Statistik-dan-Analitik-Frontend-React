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
  LogoutIcon,
  PaketHargaIcon,
  KontrolFiturIcon,
  ManajemenUserIcon
} from "../../Icon/Icon";

export default function NavButton({
  keyword,
  tab,
  onClick,
  disabled = false,
  disabledMessage = ""
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const arr = {
    overview: OverviewIcon,
    analisis: AnalisisIcon,
    histori: HistoriIcon,
    buatInfografis: BuatInfografisIcon,
    sambungkanAkun: SambungkanAkunIcon,
    botKnowledge: BotKnowledgeIcon,
    tentangAkun: TentangAkunIcon,
    langgananDanBilling: LanggananBillingIcon,
    logout: LogoutIcon,
    paketDanHarga: PaketHargaIcon,
    kontrolFitur: KontrolFiturIcon,
    manajemenUser: ManajemenUserIcon,
  };

  const IconComponent = arr[keyword];

  const capitalize = (str) => {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .trim();
  };

  const perSlash = location.pathname.split("/").filter(Boolean);
  const currentTab = perSlash[1];
  const currentKeyword = perSlash[2];

  const isActive =
    (location.pathname === "/dashboard" && keyword === "overview") ||
    (currentTab === tab && currentKeyword === keyword);

  const handleClick = (e) => {
    if (disabled) {
      if (e) e.stopPropagation();
      alert(disabledMessage || "Fitur ini sedang dinonaktifkan oleh administrator.");
      return;
    }

    if (keyword === "overview") {
      navigate(`/dashboard`);
    } else {
      navigate(`/dashboard/${tab}/${keyword}`);
    }
  };

  return (
    <div
      className={`${styles.container} ${isActive ? styles.active : ""} ${disabled ? styles.disabled : ""}`}
      onClick={
        disabled
          ? () => alert(disabledMessage || "Fitur ini sedang dinonaktifkan oleh administrator.")
          : onClick || handleClick
      }
      title={disabled ? disabledMessage || "Fitur dinonaktifkan oleh administrator" : ""}
    >
      <div className={`${styles.icon} ${isActive ? styles.iconActive : ""}`}>
        {IconComponent && <IconComponent />}
      </div>
      <div>{capitalize(keyword)}</div>
      {disabled && <span className={styles.disabledBadge}>Off</span>}
    </div>
  );
}