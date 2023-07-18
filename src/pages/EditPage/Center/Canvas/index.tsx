import React, { useEffect } from "react";
import styles from "./index.module.less";
import useEditStore, { addCmp, clearCanvas, fetchCanvas } from "src/store/editStore";
import Cmp from '../Cmp'
import { useCanvasId } from "src/store/hooks";
import EditBox from "../EditBox";
import useZoomStore from "src/store/zoomStore";

export default function Canvas() {
    const { zoom } = useZoomStore()
    const { canvas, assembly } = useEditStore()
    const { cmps, style } = canvas
    const id = useCanvasId()

    useEffect(() => {
        if (id) {
            fetchCanvas(id)
        } else {
            clearCanvas()
        }
    }, [])

    const onDrop = (e) => {
        //读取被拖拽的组件信息
        let dragCmp = e.dataTransfer.getData('drag-cmp')
        if (!dragCmp) {
            return
        }
        dragCmp = JSON.parse(dragCmp)

        //读取用户松手的位置
        const endX = e.pageX
        const endY = e.pageY

        const canvasDomPos = {
            top: 114,
            left: document.body.clientWidth / 2 - (((style.width as number) / 2) * (zoom / 100))
        }

        let disX = endX - canvasDomPos.left
        let disY = endY - canvasDomPos.top

        //组件同等比例移动
        disX = disX * (100 / zoom)
        disY = disY * (100 / zoom)

        dragCmp.style.left = disX - dragCmp.style.width / 2;
        dragCmp.style.top = disY - dragCmp.style.height / 2;

        addCmp(dragCmp)
    }
    const allowDrag = (e) => {
        e.preventDefault();
    }
    return (
        <div
            id="canvas"
            style={{
                ...style,
                backgroundImage: `url(${style.backgroundImage})`,
                transform: `scale(${zoom / 100})`
            }}
            className={styles.main}
            tabIndex={0}
            onDrop={onDrop}
            onDragOver={allowDrag}
        >
            <EditBox />
            {cmps.map((item, index) => (
                <Cmp key={item.key} cmp={item} index={index} isSelected={assembly.has(index)} />
            )
            )}
        </div>
    );
}
