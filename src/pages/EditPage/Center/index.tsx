import React from "react";
import styles from "./index.module.less";
import Canvas from "./Canvas";
import useEditStore, { addZIndex, bottomZIndex, delSelectedCmps, setAllCmpSelected, setCmpSelected, subZIndex, topZIndex, updateAssemblyCmpsByDistance, updateSelectedCmpStyle } from "src/store/editStore";
import Zoom from "./Zoom";
import useZoomStore from "src/store/zoomStore";

export default function Center() {
  const canvas = useEditStore(state => state.canvas)
  const { zoom, zoomIn, zoomOut } = useZoomStore()

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as Element).nodeName === 'TEXTAREA') {
      return
    }
    //command
    if (e.metaKey) {
      switch (e.code) {
        case 'KeyA':
          setAllCmpSelected()
          return
        case 'Equal':
          zoomOut()
          e.preventDefault()
          return
        case 'Minus':
          zoomIn()
          e.preventDefault()
          return
        //上移一层
        case 'ArrowUp':
          e.preventDefault()
          if (e.shiftKey) {
            //shift置顶
            topZIndex()
          } else {
            addZIndex();
          }
          return
        //下移一层
        case 'ArrowDown':
          e.preventDefault()
          if (e.shiftKey) {
            //shift置底
            bottomZIndex()
          } else {
            subZIndex();
          }
          return
      }
    }

    switch (e.code) {
      case 'Backspace':
        delSelectedCmps()
        return;
      //左移
      case 'ArrowLeft':
        e.preventDefault()
        updateAssemblyCmpsByDistance({ left: -1 })
        return;

      //右移
      case 'ArrowRight':
        e.preventDefault()
        updateAssemblyCmpsByDistance({ left: 1 })
        return;
      //上移
      case 'ArrowUp':
        e.preventDefault()
        updateAssemblyCmpsByDistance({ top: -1 })
        return;
      //下移
      case 'ArrowDown':
        e.preventDefault()
        updateAssemblyCmpsByDistance({ top: 1 })
        return;
    }

  }

  return (
    <div
      id="center"
      className={styles.main}
      style={{
        minHeight: (zoom / 100) * canvas.content.style.height + 100
      }}
      tabIndex={0}
      onClick={(e: React.MouseEvent) => {
        if ((e.target as HTMLElement).id.indexOf("cmp") === -1) {
          setCmpSelected(-1);
        }
      }}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => {
        e.preventDefault()
      }}
    >
      <Canvas />
      <Zoom />
    </div>
  );
}
