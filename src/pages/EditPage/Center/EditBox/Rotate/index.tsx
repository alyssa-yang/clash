import classNames from "classnames";
import { throttle, transform } from "lodash";
import { ICmpWithKey } from "src/store/editStoreTypes";
import {
  recordCanvasChangeHistory_2,
  updateSelectedCmpStyle,
} from "src/store/editStore";
import styles from "./index.module.less";

interface IRotateProps {
  zoom: number
  selectedCmp: ICmpWithKey
}

export default function Rotate(props: IRotateProps) {
  const { selectedCmp, zoom } = props
  const { style } = selectedCmp
  const { height, transform } = style

  const rotate = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    //角度转弧度：角度*派/180
    const angle = ((transform + 90) * Math.PI) / 180

    const radius = height / 2;

    const [offsetX, offsetY] = [
      -Math.cos(angle) * radius,
      -Math.sin(angle) * radius,
    ]

    const startX = e.pageX + offsetX;
    const startY = e.pageY + offsetY;

    const move = throttle((e) => {
      const x = e.pageX
      const y = e.pageY

      let disX = x - startX
      let disY = y - startY

      disX = disX * (100 / zoom)
      disY = disY * (100 / zoom)
      //弧度转角度
      let deg = 180 / Math.PI * Math.atan2(disY, disX) - 90
      //取整
      deg = Math.ceil(deg)

      updateSelectedCmpStyle({ transform: deg }, false)
    }, 50)

    const up = () => {
      recordCanvasChangeHistory_2()
      document.removeEventListener('mouseover', move)
      document.removeEventListener('mouseup', up)
    }
    document.addEventListener('mouseover', move)
    document.addEventListener('mouseup', up)
  }
  return <div
    className={classNames(styles.rotate, "iconfont icon-yulanxuanzhuan")}
    onMouseDown={rotate}
  />
}