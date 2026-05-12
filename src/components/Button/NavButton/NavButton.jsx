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

export default function NavButton({ icon, children }) {

  const arr = {
    overview: OverviewIcon,
    analisis: AnalisisIcon,
    histori: HistoriIcon,
    sambungkanAkun: SambungkanAkunIcon,
    botKnowledge: BotKnowledgeIcon,
    tentangAkun: TentangAkunIcon,
    langgananBilling: LanggananBillingIcon
  };

  const IconComponent = arr[icon];

  return (
    <div className={styles.container}>
      <div className={styles.icon}>{IconComponent && <IconComponent />}</div>
      <div>{children}</div>
    </div>
  );
}