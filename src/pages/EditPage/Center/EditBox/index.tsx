
import { throttle } from "lodash";
import styles from "./index.module.less";
import useEditStore, { recordCanvasChangeHistory_2, setCmpSelected, updateAssemblyCmpsByDistance, updateSelectedCmpAttr, updateSelectedCmpStyle } from "src/store/editStore";
import useZoomStore from "src/store/zoomStore";
import StretchDots from "./StretchDots";
import { isGroupComponent, isTextComponent } from "src/utils/const";

import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Menu from "../Menu";
import AlignLines from "./AlignLines";
import Rotate from "./Rotate";
import { computeBoxStyle } from "src/utils";
import EditBoxOfMultiCmps from "./EditBoxOfMultiCmps";

export default function EditBox() {
    const [canvas, assembly] = useEditStore(state => [state.canvas, state.assembly])
    const cmps = canvas.content.cmps
    const canvasStyle = canvas.content.style
    const zoom = useZoomStore(state => state.zoom)
    const selectedIndex = Array.from(assembly)[0];

    const selectedCmp = cmps[selectedIndex]
    const [textareaFocused, setTextareaFocused] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    useEffect(() => {
        setShowMenu(false);
    }, [selectedIndex]);

    const onMouseDown = (e: React.MouseEvent) => {
        if (textareaFocused) {
            return
        }
        let startX = e.pageX;
        let startY = e.pageY;

        const move = throttle((e) => {
            const x = e.pageX;
            const y = e.pageY;

            let disX = x - startX;
            let disY = y - startY

            disX = disX * (100 / zoom)
            disY = disY * (100 / zoom)

            updateAssemblyCmpsByDistance({ top: disY, left: disX }, true)
            startX = x
            startY = y


        }, 50)
        const up = () => {
            //隐藏吸附线
            document.querySelectorAll('.alignLine').forEach(ele => {
                (ele as HTMLElement).style.display = 'none'
            })
            recordCanvasChangeHistory_2()
            document.removeEventListener('mousemove', move)
            document.removeEventListener('mouseup', up)
        }
        document.addEventListener('mousemove', move)
        document.addEventListener('mouseup', up)
    }

    const size = assembly.size
    if (size === 0) {
        return null
    }
    if (size > 1) {
        return (
            <EditBoxOfMultiCmps
                onMouseDownOfCmp={onMouseDown}
                showMenu={showMenu}
                setShowMenu={setShowMenu}
            />
        );
    }

    let { top, left, width, height } = computeBoxStyle(cmps, assembly)

    // 边框加在外层
    width += 4;
    height += 4;



    const transform = `rotate(${size === 1 ? selectedCmp.style.transform : 0
        }deg)`;

    const doubleClickEditBox = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (selectedCmp.type & isTextComponent) {
            setTextareaFocused(true);
        } else if (selectedCmp.type & isGroupComponent) {
            const canvasDomPos = {
                top: 114 + 1,
                left: document.body.clientWidth / 2 - (((canvasStyle.width + 2) / 2) * (zoom / 100))
            }
            const relativePosition = {
                top: e.pageY - canvasDomPos.top,
                left: e.pageX - canvasDomPos.left
            }
            const len = cmps.length
            for (let i = len - 1; i >= 0; i--) {
                const cmp = cmps[i]
                if (cmp.groupKey !== selectedCmp.key) {
                    continue
                }
                const { top, left, width, height } = cmps[i].style

                const right = left + width, bottom = top + height;
                if (
                    relativePosition.top >= top &&
                    relativePosition.top <= bottom &&
                    relativePosition.left >= left &&
                    relativePosition.left <= right
                ) {
                    // 选中子节点
                    setCmpSelected(i);
                    return;
                }
            }
        }
    }
    return (
        <>
            {<AlignLines canvasStyle={canvasStyle} />}
            <div
                className={styles.main}
                style={{
                    zIndex: 99999,
                    width,
                    height,
                    top,
                    left,
                    transform
                }}
                onMouseDown={onMouseDown}
                onMouseLeave={() => {
                    setTextareaFocused(false)
                    setShowMenu(false)
                }}
                onClick={(e) => {
                    e.stopPropagation()
                }}
                onDoubleClick={doubleClickEditBox}
                onContextMenu={() => {
                    setShowMenu(true)
                }}
            >
                {selectedCmp.type === isTextComponent && textareaFocused &&
                    <TextareaAutosize
                        value={selectedCmp.value}
                        style={{ ...selectedCmp.style, top: 0, left: 0 }}
                        onChange={e => {
                            const newValue = e.target.value
                            updateSelectedCmpAttr('value', newValue)
                        }}
                        onHeightChange={(height) => {
                            updateSelectedCmpStyle({ height })
                        }}
                    />}

                {showMenu && <Menu
                    style={{
                        left: width - 2,
                        transform: `rotate(${size === 1 ? -selectedCmp.style.transform : 0
                            }deg)`,
                        transformOrigin: "0% 0%",
                    }}
                    assemblySize={size} cmps={cmps} selectedIndex={selectedIndex} />}

                <StretchDots zoom={zoom} style={{ height, width }} />

                {selectedCmp.type !== isGroupComponent && <Rotate zoom={zoom} selectedCmp={selectedCmp} />}
            </div>
        </>
    );
}
