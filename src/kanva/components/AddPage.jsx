import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { FaRegCopy } from "react-icons/fa6";
import { BsArrowUp, BsArrowDown } from "react-icons/bs";
import { MdOutlineDelete, MdExposurePlus1 } from "react-icons/md";
import { setActiveIndex, setPopUp, setSelectedUniqueId } from "../store/editorReducer";
import styles from './AddPage.module.css';

export default function AddPage({ setPagesWithHistory }) {
    const dispatch = useDispatch();
    const { activeIndex, editorPages } = useSelector((state) => state?.editor || {});
    const [menuOpenIdx, setMenuOpenIdx] = useState(null);

    const handleSwitchPage = (idx) => {
        dispatch(setActiveIndex(idx));
        dispatch(setSelectedUniqueId(null));
        dispatch(setPopUp(false));
        setMenuOpenIdx(null);
    };

    const addPage = () =>
        setPagesWithHistory((prev) => {
            const next = [...prev, { id: prev?.length + 1, children: [], background: "#ffffff" }];
            setTimeout(() => dispatch(setActiveIndex(next?.length - 1)), 0);
            return next;
        });

    const duplicatePage = (idx) =>
        setPagesWithHistory((prev) => {
            const cp = JSON.parse(JSON.stringify(prev));
            const copy = { ...JSON.parse(JSON.stringify(cp[idx])), id: cp?.length + 1 };
            cp?.splice(idx + 1, 0, copy);
            setTimeout(() => dispatch(setActiveIndex(idx + 1)), 0);
            return cp;
        });

    const deletePage = (idx) =>
        setPagesWithHistory((prev) => {
            const cp = [...prev];
            cp?.splice(idx, 1);
            const newIndex = Math.max(0, Math.min(cp?.length - 1, idx - 1));
            setTimeout(() => dispatch(setActiveIndex(newIndex)), 0);
            return cp;
        });

    const moveUp = (idx) =>
        setPagesWithHistory((prev) => {
            if (idx <= 0) return prev;
            const cp = [...prev];
            [cp[idx - 1], cp[idx]] = [cp[idx], cp[idx - 1]];
            setTimeout(() => dispatch(setActiveIndex(idx - 1)), 0);
            return cp;
        });

    const moveDown = (idx) =>
        setPagesWithHistory((prev) => {
            if (idx >= prev?.length - 1) return prev;
            const cp = [...prev];
            [cp[idx + 1], cp[idx]] = [cp[idx], cp[idx + 1]];
            setTimeout(() => dispatch(setActiveIndex(idx + 1)), 0);
            return cp;
        });

    return (
        <div className={styles.container}>
            {editorPages?.map((p, idx) => {
                const isActive = idx === activeIndex;
                return (
                    <div key={p?.id ?? idx} className={styles.pageItem}>
                        <button
                            className={`${styles.pageBtn} ${isActive ? styles.pageBtnActive : ""}`}
                            onClick={() => handleSwitchPage(idx)}
                            onContextMenu={(e) => { e.preventDefault(); setMenuOpenIdx(idx === menuOpenIdx ? null : idx); }}
                            title={`Page ${idx + 1} — Right-click for options`}
                        >
                            {idx + 1}
                        </button>
                        {menuOpenIdx === idx && (
                            <>
                                <div className={styles.menuBackdrop} onClick={() => setMenuOpenIdx(null)} />
                                <div className={styles.menu}>
                                    <button className={styles.menuItem} onClick={() => { duplicatePage(idx); setMenuOpenIdx(null); }}>
                                        <FaRegCopy size={13} /> Duplicate
                                    </button>
                                    <button className={styles.menuItem} disabled={idx === 0} onClick={() => { moveUp(idx); setMenuOpenIdx(null); }}>
                                        <BsArrowUp size={13} /> Move Up
                                    </button>
                                    <button className={styles.menuItem} disabled={idx === editorPages?.length - 1} onClick={() => { moveDown(idx); setMenuOpenIdx(null); }}>
                                        <BsArrowDown size={13} /> Move Down
                                    </button>
                                    {editorPages?.length > 1 && (
                                        <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={() => { deletePage(idx); setMenuOpenIdx(null); }}>
                                            <MdOutlineDelete size={14} /> Delete
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
            <button className={styles.addBtn} onClick={addPage} title="Add page">
                <MdExposurePlus1 size={20} />
            </button>
        </div>
    );
}