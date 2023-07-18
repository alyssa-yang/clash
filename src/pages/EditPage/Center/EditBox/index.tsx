
import { throttle } from "lodash";
import styles from "./index.module.less";
import useEditStore, { recordCanvasChangeHistory_2, updateAssemblyCmpsByDistance, updateSelectedCmpAttr, updateSelectedCmpStyle } from "src/store/editStore";
import useZoomStore from "src/store/zoomStore";
import StretchDots from "./StretchDots";
import { isTextComponent } from "../../LeftSider";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Menu from "../Menu";

export default function EditBox() {
    const [cmps, assembly] = useEditStore(state => [state.canvas.cmps, state.assembly])
    const zoom = useZoomStore(state => state.zoom)
    const selectedCmp = cmps[Array.from(assembly)[0]]

    const [textareaFocused, setTextareaFocused] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    const onMouseDown = (e: React.MouseEvent) => {
        let startX = e.pageX;
        let startY = e.pageY;

        const move = throttle((e) => {
            const x = e.pageX;
            const y = e.pageY;

            let disX = x - startX;
            let disY = y - startY

            disX = disX * (100 / zoom)
            disY = disY * (100 / zoom)

            updateAssemblyCmpsByDistance({ top: disY, left: disX })
            startX = x
            startY = y
        }, 100)
        const up = () => {
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

    let top = 9999, left = 9999, bottom = -9999, right = -9999;
    assembly.forEach(index => {
        const cmp = cmps[index]
        top = Math.min(top, cmp.style.top)
        left = Math.min(left, cmp.style.left)
        bottom = Math.max(bottom, cmp.style.top + cmp.style.height)
        right = Math.max(right, cmp.style.left + cmp.style.width)
    })
    const width = right - left + 8
    const height = bottom - top + 8
    top -= 2
    left -= 2
    return (
        <div
            className={styles.main}
            style={{
                zIndex: 99999,
                width,
                height,
                top,
                left
            }}
            onMouseDown={onMouseDown}
            onMouseLeave={() => {
                setTextareaFocused(false)
            }}
            onClick={(e) => {
                e.stopPropagation()
                setShowMenu(false)
            }}
            onDoubleClick={() => setTextareaFocused(true)}
            onContextMenu={() => {
                setShowMenu(true)
            }}
        >
            {size === 1 && selectedCmp.type === isTextComponent && textareaFocused &&
                <TextareaAutosize
                    value={selectedCmp.value}
                    style={{ ...selectedCmp.style, top: 2, left: 2 }}
                    onChange={e => {
                        const newValue = e.target.value
                        updateSelectedCmpAttr('value', newValue)
                    }}
                    onHeightChange={(height) => {
                        updateSelectedCmpStyle({ height })
                    }}
                />}
            {showMenu && <Menu style={{ left: width }} assemblySize={size} />}
            <StretchDots zoom={zoom} style={{ height, width }} />
        </div>
    );
}
