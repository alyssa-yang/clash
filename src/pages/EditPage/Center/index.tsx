import React from "react";
import styles from "./index.module.less";
import Canvas from "./Canvas";
import useEditStore, { addZIndex, delSelectedCmps, setAllCmpSelected, setCmpSelected, subZIndex } from "src/store/editStore";
import Zoom from "./Zoom";
import useZoomStore from "src/store/zoomStore";

export default function Center() {
  const canvas = useEditStore(state => state.canvas)
  const { zoom, zoomIn, zoomOut } = useZoomStore()

  const onKeyDown = (e) => {
    if ((e.target as Element).nodeName === 'TEXTAREA') {
      return
    }
    switch (e.code) {
      case 'Backspace':
        delSelectedCmps()
        return;
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
          addZIndex();
          e.preventDefault()
          return
        //下移一层
        case 'ArrowDown':
          subZIndex();
          e.preventDefault()
          return
      }
    }

  }

  return (
    <div
      id="center"
      className={styles.main}
      style={{
        minHeight: (zoom / 100) * canvas.style.height + 100
      }}
      tabIndex={0}
      onClick={e => {
        if (e.target?.id === 'center') {
          setCmpSelected(-1)
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
