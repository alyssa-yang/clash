import leftSideStyles from "./leftSide.module.less";
import { useEffect, useState } from "react";
import { getTemplateListEnd } from "src/request/end";
import Axios from "src/request/axios";
import { settings } from "./tpl";


const TemplateSider = () => {
  const [list, setList] = useState([]);

  const fresh = async () => {
    const res: any = await Axios.get(getTemplateListEnd);
    const data = res?.content || [];
    setList(data);
  };
  useEffect(() => {
    fresh();
  }, []);


  return (
    <div className={leftSideStyles.main}>
      <ul className={leftSideStyles.box}>
        {settings.map((item: any) => (
          <li
            className={leftSideStyles.item}
            key={item.id}
            onClick={() => {
              addCanvasByTemplate(item);
            }}>
            <div className={leftSideStyles.desc}>{item.title}</div>
            <img src={item.thumbnail?.header} alt={item.title} />
          </li>
        ))}
        {list.map((item: any) => (
          <li
            className={leftSideStyles.item}
            key={item.id}
            onClick={() => {
              addCanvasByTemplate(item);
            }}>
            <div className={leftSideStyles.desc}>{item.title}</div>
            <img
              src={
                // item.thumbnail?.header ||
                "https://www.bubucuo.cn/react-head.png"
              }
              alt={item.title}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TemplateSider;
