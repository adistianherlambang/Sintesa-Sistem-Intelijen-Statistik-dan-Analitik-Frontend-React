import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "./UIControls";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as AiIcons from "react-icons/ai";
import { setPopUp, setSelectedUniqueId } from "../store/editorReducer";

export default function Element({ setPagesWithHistory }) {
    const dispatch = useDispatch();
    const { activeIndex } = useSelector((state) => state?.editor ?? {});

    const [search, setSearch] = useState("");

    // merge icon sets once
    const allIcons = useMemo(() => ({ ...FaIcons, ...MdIcons, ...AiIcons }), []);

    // only filter what is needed
    const iconsArray = useMemo(
        () =>
            Object?.entries(allIcons)
                ?.filter(([name]) =>
                    name?.toLowerCase()?.includes(search?.toLowerCase())
                )
                ?.slice(0, 200),
        [allIcons, search]
    );

    const addShape = (IconComp, name) => {
        const id = `icon-${Date.now()}`;

        // get SVG path from ReactIcon
        const svgElement = IconComp({ size: 24 });
        const path = svgElement?.props?.children[0]?.props?.d;


        setPagesWithHistory((prev) => {
            const cp = JSON.parse(JSON.stringify(prev));
            const page =
                cp[activeIndex] || {
                    id: activeIndex + 1,
                    children: [],
                    background: "#ffffff",
                };

            page?.children?.push({
                id,
                type: "icon",
                name,
                path,
                x: 150,
                y: 200,
                width: 10,
                height: 10,
                rotation: 0,
                color: "#000",
                opacity: 1,
            });

            cp[activeIndex] = page;
            return cp;
        });

        dispatch(setSelectedUniqueId(id));
        dispatch(setPopUp(false));
    };

    return (
        <>
            <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 12 }}
            />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))",
                    gap: 12,
                }}
            >
                {iconsArray && iconsArray?.map(([name, IconComp]) => (
                    <div
                        key={name}
                        onClick={() => addShape(IconComp, name)}
                        style={{
                            cursor: "pointer",
                            
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: 50,
                            background: "rgba(255, 255, 255, 0.03)",
                            color: "#fff",
                            transition: "all 0.2s ease",
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = "#34B34A";
                            e.currentTarget.style.backgroundColor = "rgba(52, 179, 74, 0.08)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                        }}
                    >
                        <IconComp size={24} />
                    </div>
                ))}
            </div>
        </>
    );
};