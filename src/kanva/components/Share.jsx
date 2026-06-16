import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import { BsDownload } from "react-icons/bs";
import { FaRegFilePdf } from "react-icons/fa6";
import { TbPhotoDown } from "react-icons/tb";
import styles from './Share.module.css';

export default function Share({ stageRef }) {
    const { editorPages, activeIndex } = useSelector((state) => state?.editor ?? {});
    const [open, setOpen] = useState(false);
    const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
    const btnRef = useRef(null);

    const getFileName = (ext) =>
        `page-${(editorPages[activeIndex] || {})?.id || activeIndex}.${ext}`;

    const downloadURI = (uri, name) => {
        const link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPNG = () => {
        const uri = stageRef?.current?.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
        downloadURI(uri, getFileName("png"));
        setOpen(false);
    };

    const exportJPG = () => {
        const uri = stageRef?.current?.toDataURL({ pixelRatio: 2, mimeType: "image/jpeg" });
        downloadURI(uri, getFileName("jpg"));
        setOpen(false);
    };

    const exportPDF = () => {
        const uri = stageRef?.current?.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
        const pdf = new jsPDF("l", "pt", [stageRef?.current?.width(), stageRef?.current?.height()]);
        pdf?.addImage(uri, "PNG", 0, 0, stageRef?.current?.width(), stageRef?.current?.height());
        pdf?.save(getFileName("pdf"));
        setOpen(false);
    };

    const handleToggle = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setDropPos({
                top: rect.bottom + 6,
                right: window.innerWidth - rect.right,
            });
        }
        setOpen(o => !o);
    };

    // Close on scroll or resize
    useEffect(() => {
        if (!open) return;
        const close = () => setOpen(false);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
        return () => {
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [open]);

    return (
        <div className={styles.wrapper}>
            <button ref={btnRef} className={styles.triggerBtn} onClick={handleToggle} title="Download">
                <BsDownload size={16} />
            </button>
            {open && (
                <>
                    <div className={styles.backdrop} onClick={() => setOpen(false)} />
                    <div
                        className={styles.dropdown}
                        style={{
                            position: 'fixed',
                            top: dropPos.top,
                            right: dropPos.right,
                            zIndex: 99999,
                        }}
                    >
                        <p className={styles.dropTitle}>Export Options</p>
                        <button className={styles.dropItem} onClick={exportPNG}>
                            <TbPhotoDown size={16} /> Download PNG
                        </button>
                        <button className={styles.dropItem} onClick={exportJPG}>
                            <TbPhotoDown size={16} /> Download JPG
                        </button>
                        <button className={styles.dropItem} onClick={exportPDF}>
                            <FaRegFilePdf size={16} /> Download PDF
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}