import { defaultComponentStyle, isImgComponent } from "src/utils/const";
import { addCmp } from "src/store/editStore";
import leftSideStyles from "./leftSide.module.less";
import { serverHost } from "src/request/end";

const defaultStyle = {
  ...defaultComponentStyle,
};

const url = `${serverHost}/static/upload/`;

const settings = [
  {
    value: url + "4fdab825ad4ed8fb38ed0e95342234eb.gif",
    style: defaultStyle,
  },

  {
    value: url + "7ac83d46f61550a74a0d664e6ec0473f.jpg",
    style: defaultStyle,
  },
  {
    value: url + "9eb7432f09d319aefd7ad92ad74f5cc7.jpeg",
    style: defaultStyle,
  },
  {
    value: url + "41dcc994e9746dbe6e0e555bba36defa.png",
    style: defaultStyle,
  },
  {
    value: url + "123ecb5e0ace8717b86e05dba4f9a8ee.png",
    style: defaultStyle,
  },
  {
    value: url + "a41aeb8672805de1eb0094cf2a2f158e.jpg",
    style: defaultStyle,
  },
  {
    value: url + "ee144b4452cfc7cb058248230149d69b.jpeg",
    style: defaultStyle,
  },
  {
    value: url + "29e6f31e956905c829974c958a2f54d1.jpeg",
    style: defaultStyle,
  },

  {
    value: url + "2397e6e8269d9bd3deca71967a944547.png",
    style: defaultStyle,
  },
  {
    value: url + "718cee396b07126878cdb0f278e90dfb.png",
    style: defaultStyle,
  },
  {
    value: url + "da36bb03acda461ddd498ffc47987b05.jpeg",
    style: defaultStyle,
  },
  {
    value: url + "edfa08d4aad6849f8578f0d008a8cb42.jpeg",
    style: defaultStyle,
  },

  {
    value: url + "ba6c7d4b6cc628eb240f7b32d826e007.jpg",
    style: defaultStyle,
  },
  {
    value: url + "cf3fbe3067cc64d0514e404862549947.jpeg",
    style: defaultStyle,
  },
  {
    value: url + "f77e0098a9aaa302f49922699636a5ff.png",
    style: defaultStyle,
  },
  {
    value: url + "f0604a733528accfa033de81e0c1fd6b.png",
    style: defaultStyle,
  },

  {
    value: url + "fa91c45442be0e57d7caeb29c9367f8f.png",
    style: defaultStyle,
  },

];

const arithmetic = [
  "balloon-1",
  "balloon-2",
  "balloon-green",
  "cloud",
  "fairytale.webp",
  "five-balls",
  "flower",
  "girl-balloon",
  "green-learning",
  "heart-balloon",
  "prince",
  "red-flower",
  "ribbons",
  "up",
  "wing",
];

arithmetic.forEach((item) => {
  settings.push({
    value: `https://commom.pek3b.qingstor.com/all/arithmetic/${item.indexOf(".") > 0 ? item : item + ".png"
      }`,
    style: defaultStyle,
  });
});

const ImgSider = () => {
  console.log("ImgSider render"); //sy-log
  return (
    <div className={leftSideStyles.main}>
      <ul className={leftSideStyles.box}>
        {settings.map((item) => (
          <li
            draggable={true}
            key={item.value}
            className={leftSideStyles.item}
            onClick={() => addCmp({ ...item, type: isImgComponent } as any)}
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "drag-cmp",
                JSON.stringify({ ...item, type: isImgComponent })
              );
            }}>
            <img src={item.value} draggable={false} alt="" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImgSider;
