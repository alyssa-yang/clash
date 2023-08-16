import classNames from "classnames";
import styles from "./index.module.less";
import useZoomStore from "src/store/zoomStore";
import { Button, Dropdown, InputNumber, MenuProps } from "antd";

export default function Zoom() {
  const { zoom, zoomIn, zoomOut, setZoom, addReferenceLineX, addReferenceLineY, clearReferenceLine } = useZoomStore();

  const items: MenuProps['items'] = [
    {
      key: 'horizontal',
      label: (
        <a onClick={() => addReferenceLineX()}>
          横向参考线
        </a>
      ),
    },
    {
      key: 'vertical',
      label: (
        <a onClick={() => addReferenceLineY()}>
          竖向参考线
        </a>
      ),
    },
    {
      key: '3',
      label: (
        <a onClick={() => clearReferenceLine()}>
          删除参考线
        </a>
      ),
    },
  ];
  return (<>
    <ul className={styles.zoom}>
      <li
        className={classNames(styles.icon)}
        style={{ cursor: "zoom-out" }}
        onClick={zoomIn}>
        -
      </li>
      <li className={classNames(styles.num)}>
        <InputNumber
          addonAfter='%'
          min={50}
          precision={0}
          step={5}
          value={zoom}
          onChange={(value: any) => {
            setZoom(value);
          }}
        />
      </li>
      <li
        className={classNames(styles.icon)}
        style={{ cursor: "zoom-in" }}
        onClick={zoomOut}>
        +
      </li>
      <li className={styles.reference}>
        <Dropdown menu={{ items }} placement="top">
          <Button>参考线</Button>
        </Dropdown>
      </li>
    </ul>

  </>
  );
}
