import { useState } from "react";
import styles from "./index.module.less";
import useEditStore from "src/store/editStore";
import EditCanvas from "./EditCanvas";
import EditCmp from "./EditCmp";
import EditMultiCmp from "./EditMultiCmp";

//画布
//单个组件
//多个组件
export default function RightSider() {
  const [canvas, assembly] = useEditStore(state => [state.canvas, state.assembly])
  const [showEdit, setShowEdit] = useState(true);
  const title = assembly.size === 0 ? '画布属性' : (assembly.size === 1 ? '组件属性' : '多组件属性')
  return (
    <div className={styles.main}>
      <div className={styles.titleBox}>
        <div className={styles.title}>{title}</div>
        <div
          className={styles.switch}
          onClick={() => {
            setShowEdit(!showEdit);
          }}>
          {showEdit ? "隐藏编辑区域" : "显示编辑区域"}
        </div>
      </div>
      {showEdit ? <div className={styles.box}>
        {assembly.size === 0 && <EditCanvas canvas={canvas} />}

        {assembly.size === 1 && <EditCmp selectedCmp={canvas.cmps[Array.from(assembly)[0]]} />}

        {assembly.size > 1 && <EditMultiCmp />}

      </div> : null
      }
    </div>
  );
}
