import { defaultComponentStyle, isTextComponent } from "src/utils/const";
import leftSideStyles from "./leftSide.module.less";
import { addCmp } from "src/store/editStore";

const defaultStyle: any = {
  ...defaultComponentStyle,
  width: 170,
  height: 30,
  lineHeight: "30px",
  fontSize: 12,
  fontWeight: "normal",
  textDecoration: "none",
  color: "#000",
  backgroundColor: "#ffffff00",
  textAlign: "center",
  wordSpacing: "10px",
};

const settings = [
  {
    value: "双击编辑标题",
    style: {
      ...defaultStyle,
      fontSize: 28,
      height: 50,
      lineHeight: "50px",
    },
  },
  {
    value: "双击编辑正文",
    style: defaultStyle,
  },
];

const TextSider = () => {
  console.log("TextSide render"); //sy-log
  return (
    <div className={leftSideStyles.main}>
      <ul className={leftSideStyles.box}>
        {settings.map((item) => (
          <li
            key={item.value}
            draggable={true}
            onDragStart={e => {
              e.dataTransfer.setData('drag-cmp', JSON.stringify({ ...item, type: isTextComponent }))
            }}
            className={leftSideStyles.item}
            onClick={() => addCmp({ ...item, type: isTextComponent } as any)}>
            {item.value.indexOf("双击编辑") > -1
              ? item.value.slice(4)
              : item.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TextSider;
