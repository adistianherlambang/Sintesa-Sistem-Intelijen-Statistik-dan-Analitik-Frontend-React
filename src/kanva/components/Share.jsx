import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import { BsDownload } from "react-icons/bs";
import { FaRegFilePdf } from "react-icons/fa6";
import { TbPhotoDown } from "react-icons/tb";
import styles from './Share.module.css';

export default function Share({ stageRef }) {
    const { editorPages, activeIndex, canvasSize } = useSelector((state) => state?.editor ?? {});
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

    /**
     * Ekspor hanya area halaman infografis.
     * Pendekatan: simpan state stage, reset posisi/skala/ukuran ke canvasSize,
     * ekspor (canvas HTML secara native memotong konten di luar batasnya),
     * lalu kembalikan state semula.
     */
    const getPageDataURL = (mimeType) => {
        const stage = stageRef?.current;
        if (!stage) return null;

        const w = canvasSize?.w;
        const h = canvasSize?.h;
        if (!w || !h) return stage.toDataURL({ mimeType, pixelRatio: 1 });

        // Simpan state saat ini
        const savedX      = stage.x();
        const savedY      = stage.y();
        const savedScaleX = stage.scaleX();
        const savedScaleY = stage.scaleY();
        const savedW      = stage.width();
        const savedH      = stage.height();

        // Reset ke full-page 1:1 di origin
        stage.x(0);
        stage.y(0);
        stage.scaleX(1);
        stage.scaleY(1);
        stage.width(w);
        stage.height(h);
        stage.draw(); // redraw sinkron dengan transform baru

        const uri = stage.toDataURL({ mimeType, pixelRatio: 1 });

        // Kembalikan state semula
        stage.x(savedX);
        stage.y(savedY);
        stage.scaleX(savedScaleX);
        stage.scaleY(savedScaleY);
        stage.width(savedW);
        stage.height(savedH);
        stage.draw();

        return uri;
    };


    const exportPNG = () => {
        const uri = getPageDataURL("image/png");
        downloadURI(uri, getFileName("png"));
        setOpen(false);
    };

    const exportJPG = () => {
        const uri = getPageDataURL("image/jpeg");
        downloadURI(uri, getFileName("jpg"));
        setOpen(false);
    };

    const exportPDF = () => {
        const uri = getPageDataURL("image/png");
        const w = canvasSize?.w || stageRef?.current?.width();
        const h = canvasSize?.h || stageRef?.current?.height();
        const orientation = w >= h ? "l" : "p";
        const pdf = new jsPDF(orientation, "pt", [w, h]);
        pdf.addImage(uri, "PNG", 0, 0, w, h);
        pdf.save(getFileName("pdf"));
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