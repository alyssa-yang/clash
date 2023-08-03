import { useState } from "react";
import styles from "./index.module.less";
import useEditStore from "src/store/editStore";
import EditCanvas from "./EditCanvas";
import EditCmp from "./EditCmp";
import EditMultiCmp from "./EditMultiCmp";
import { isGroupComponent } from "src/utils/const";

//画布
//单个组件
//多个组件
export default function RightSider() {
  const [canvas, assembly] = useEditStore(state => [state.canvas, state.assembly])
  const [showEdit, setShowEdit] = useState(true);
  const title = assembly.size === 0 ? '画布属性' : (assembly.size === 1 ? '组件属性' : '批量修改多个组件属性')

  let isGroup = false
  const selectedCmp = canvas.content.cmps[Array.from(assembly)[0]]
  if (assembly.size === 1) {
    isGroup = !!(selectedCmp.type & isGroupComponent)
  }
  return (
    <div className={styles.main}>
      <div
        className={styles.switch}
        onClick={() => {
          setShowEdit(!showEdit);
        }}>
        {showEdit ? "隐藏编辑区域" : "显示编辑区域"}
      </div>

      {showEdit ? <div className={styles.box}>
        <div className={styles.titleBox}>
          <div className={styles.title}>{title}</div>
        </div>
        <div className={styles.boxContent}>
          {assembly.size === 0 && <EditCanvas canvas={canvas} />}

          {(assembly.size === 1 && !isGroup) ?
            <EditCmp selectedCmp={selectedCmp} formKeys={canvas.content.formKeys || []} /> :
            <EditMultiCmp isGroup={isGroup} />}
        </div>
      </div> : null
      }
    </div>
  );
}
