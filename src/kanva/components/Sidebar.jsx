import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPath } from '../store/editorReducer';

import { GrTemplate } from "react-icons/gr";
import { PiTextAaLight } from "react-icons/pi";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import { IoShapesOutline } from "react-icons/io5";
import { GrCloudUpload } from "react-icons/gr";
import { SlLayers } from "react-icons/sl";
import { PiResizeThin } from "react-icons/pi";
import { MdOutlineShapeLine } from "react-icons/md";

import Texxt from './Texxt';
import Photo from './Photo';
import Element from './Element';
import Upload from './Upload';
import Resize from './Resize';
import Banner from './Banner';
import EditingPopup from './EditingPopup';
import Layer from './Layer';
import Shape from './Shape';

import styles from './Sidebar.module.css';

const getIcon = (type) => {
    switch (type) {
        case "banner":
            return <GrTemplate style={{ fontSize: 18 }} />;
        case "text":
            return <PiTextAaLight style={{ fontSize: 18 }} />;
        case "photo":
            return <MdOutlinePhotoSizeSelectActual style={{ fontSize: 18 }} />;
        case "image":
            return <MdOutlinePhotoSizeSelectActual style={{ fontSize: 18 }} />;
        case "element":
            return <IoShapesOutline style={{ fontSize: 18 }} />;
        case "upload":
            return <GrCloudUpload style={{ fontSize: 18 }} />;
        case "layer":
            return <SlLayers style={{ fontSize: 18 }} />;
        case "resize":
            return <PiResizeThin style={{ fontSize: 18 }} />;
        case "rect":
            return <MdOutlineShapeLine style={{ fontSize: 18 }} />;
        default:
            return null;
    }
};

const Sidebar = ({ selectedEl, setElement, activePage, setPagesWithHistory, openMiniFor, stageRef }) => {
    const dispatch = useDispatch();
    const { path } = useSelector((state) => state?.editor ?? {});

    useEffect(() => {
        if (selectedEl !== undefined) {
            dispatch(setPath(undefined));
        }

        if (selectedEl?.type === 'icon') {
            dispatch(setPath("element"));
        }
    }, [selectedEl, dispatch]);

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                {getIcon(path || selectedEl?.type)}
                <span className={styles.title}>
                    {path || selectedEl?.type || "Sidebar"}
                </span>
            </div>
            <div className={styles.content}>
                {path !== undefined ? (
                    <>
                        {path === "banner" && <Banner setPagesWithHistory={setPagesWithHistory} />}
                        {path === "text" && (
                            <Texxt
                                setPagesWithHistory={setPagesWithHistory}
                                openMiniFor={openMiniFor}
                            />
                        )}
                        {path === "photo" && <Photo setPagesWithHistory={setPagesWithHistory} />}
                        {path === "element" && <Element setPagesWithHistory={setPagesWithHistory} />}
                        {path === "shape" && <Shape setPagesWithHistory={setPagesWithHistory} />}
                        {path === "upload" && <Upload setPagesWithHistory={setPagesWithHistory} />}
                        {path === "resize" && <Resize stageRef={stageRef} />}
                        {path === "layer" && (
                            <Layer
                                elements={activePage?.children || []}
                                onToggleLock={(id) => {
                                    setElement(id, (el) => ({ ...el, locked: !el?.locked }));
                                }}
                                onToggleVisibility={(id) => {
                                    setElement(id, (el) => ({ ...el, visible: !el?.visible }));
                                }}
                                onReorder={(newChildren) => {
                                    setPagesWithHistory((pages) =>
                                        pages?.map((p) =>
                                            p?.id === activePage?.id ? { ...p, children: newChildren } : p
                                        )
                                    );
                                }}
                            />
                        )}
                    </>
                ) : (
                    <EditingPopup
                        selectedEl={selectedEl}
                        setElement={setElement}
                        setPagesWithHistory={setPagesWithHistory}
                        openMiniFor={openMiniFor}
                        activePage={activePage}
                    />
                )}
            </div>
        </div>
    );
};

export default Sidebar;