import React from 'react'
import styles from "./NavButton.module.css"

//icon
import {
  OverviewIcon,
  AnalisisIcon,
  HistoriIcon,
  SambungkanAkunIcon,
  BotKnowledgeIcon,
  TentangAkunIcon,
  LanggananBillingIcon
} from "../../Icon/Icon";

export default function NavButton({ keyword }) {

  const arr = {
    overview: OverviewIcon,
    analisis: AnalisisIcon,
    histori: HistoriIcon,
    sambungkanAkun: SambungkanAkunIcon,
    botKnowledge: BotKnowledgeIcon,
    tentangAkun: TentangAkunIcon,
    langgananBilling: LanggananBillingIcon
  };

  const IconComponent = arr[keyword];

  const capitalize = (str) => {
    return str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .trim();
  };

  return (
    <div className={styles.container}>
      <div className={styles.icon}>{IconComponent && <IconComponent />}</div>
      <div>{capitalize(keyword)}</div>
    </div>
  );
}