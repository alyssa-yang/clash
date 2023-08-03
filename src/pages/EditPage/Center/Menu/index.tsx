import classNames from "classnames";
import { addZIndex, bottomZIndex, copyAssemblyCmps, delSelectedCmps, setCmpSelected, subZIndex, topZIndex } from "src/store/editStore";
import styles from "./index.module.less";
import { ICmpWithKey, Style } from "src/store/editStoreTypes";
import { isGraphComponent, isGroupComponent, isImgComponent } from "src/utils/const";
import { pick } from "lodash";

export default function Menu({
  style,
  assemblySize,
  cmps,
  selectedIndex,
}: {
  style: Style;
  assemblySize: number;
  cmps: Array<ICmpWithKey>
  selectedIndex: number
}) {
  const selectedCmp = cmps[selectedIndex]
  if (assemblySize === 0) {
    return null;
  }

  // 判断是否重叠
  function overlap(cmp: ICmpWithKey) {
    const selectedCmp = cmps[selectedIndex]
    const style1 = selectedCmp.style
    const selectedCmpStyle = {
      top: style1.top,
      left: style1.left,
      right: style1.left + style1.width,
      bottom: style1.top + style1.height
    }

    const style = cmp.style
    const currentCmpStyle = {
      top: style.top,
      left: style.left,
      right: style.left + style.width,
      bottom: style.top + style.height
    }

    if (selectedCmpStyle.top > currentCmpStyle.bottom
      || selectedCmpStyle.right < currentCmpStyle.left
      || selectedCmpStyle.bottom < currentCmpStyle.top
      || selectedCmpStyle.left > currentCmpStyle.right) {
      return false
    }
    return true
  }
  return (
    <div className={classNames(styles.main)} style={style}>
      <ul className={classNames(styles.menu)}>
        <li onClick={copyAssemblyCmps}>复制组件</li>
        <li onClick={delSelectedCmps}>删除组件</li>
        {assemblySize === 1 && (
          <>
            {selectedCmp.type !== isGroupComponent && <>
              <li onClick={addZIndex}>上移一层</li>
              <li onClick={subZIndex}>下移一层</li>
            </>}
            <li onClick={topZIndex}>置顶</li>
            <li onClick={bottomZIndex}>置底</li>
            <li>附近组件</li>
          </>
        )}
      </ul>
      {assemblySize === 1 &&
        <ul className={styles.nearByCmps}>
          {cmps.map((item: ICmpWithKey, index: number) => index === selectedIndex || !overlap(item) ? null : <Item cmp={item} index={index} />)}
        </ul>}

    </div>
  );
}
interface ItemProps {
  cmp: ICmpWithKey;
  index: number;
}

function Item(props: ItemProps) {
  const { cmp, index } = props;
  const { type, value } = cmp;

  let left, right;

  switch (type) {
    case isImgComponent:
      left = <img className={styles.left} src={value} alt="" />;
      right = "图片";
      break;

    case isGraphComponent:
      left = (
        <span
          className={styles.left}
          style={pick(cmp.style, [
            "backgroundColor",
            "borderWidth",
            "borderStyle",
            "borderColor",
            "borderRadius",
          ])}></span>
      );
      right = "图形";
      break;

    case isGroupComponent:
      left = (
        <span className={classNames(styles.left, "iconfont icon-zuhe")}></span>
      );
      right = "组合组件";
      break;
    default:
      left = (
        <span
          className={classNames(styles.left, "iconfont icon-wenben")}></span>
      );
      right = value;
      break;
  }

  return (
    <li onClick={() => setCmpSelected(index)}>
      {left}
      <span className={styles.txt}>{right}</span>
    </li>
  );
}
