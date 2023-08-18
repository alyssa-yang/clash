import {
  defaultComponentStyle,
  defaultComponentStyle_0,
  isFormComponent,
  isFormComponent_Button,
  isFormComponent_Input,
  isGroupComponent,
  isTextComponent,
} from "src/utils/const";
import useEditStore, {
  addCmp,
  selectedSingleCmpSelector,
} from "src/store/editStore";
import leftSideStyles from "./leftSide.module.less";
import { loginEnd } from "src/request/end";
import Item from "src/components/Item";
import { useEffect, useState } from "react";
import { Select } from "antd";
import { getOnlyKey } from "src/utils";

// 组合组件
const settings = [
  {
    // 既是表单组件也是组合组件
    type: isGroupComponent | isFormComponent,
    desc: "姓名",
    style: {
      ...defaultComponentStyle_0,
      width: 170,
      height: 30,
    },
    key: getOnlyKey(),
    children: [
      {
        type: isTextComponent,
        key: getOnlyKey(),
        value: "姓名",
        style: {
          ...defaultComponentStyle_0,
          width: 30,
          height: 30,
          borderRadius: "0%",
          borderStyle: "none",
          borderWidth: "0",
          borderColor: "#ffffff00",
          transform: 0,
          animationName: "",
          boxSizing: "border-box",
          lineHeight: "30px",
          fontSize: 12,
          fontWeight: "normal",
          textDecoration: "none",
          color: "#000",
          backgroundColor: "#ffffff00",
          textAlign: "left",
          wordSpacing: "10px",
        },
      },
      {
        // input
        type: isFormComponent_Input,
        formItemName: "name", // form item key
        inputType: "text",
        value: "",
        key: getOnlyKey(),
        placeholder: "请输入",
        style: {
          ...defaultComponentStyle_0,
          left: 30,
          width: 140,
          height: 30,
          lineHeight: "30px",
          fontSize: 12,
          fontWeight: "normal",
          textDecoration: "none",
          color: "#000",
          backgroundColor: "#ffffff00",
          textAlign: "left",
          wordSpacing: "10px",
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#000",
          boxSizing: "border-box",
        },
      },
    ],
  },
  {
    type: isGroupComponent | isFormComponent,
    desc: "密码",
    key: getOnlyKey(),
    style: {
      ...defaultComponentStyle_0,
      width: 170,
      height: 30,
    },
    children: [
      {
        type: isTextComponent,
        key: getOnlyKey(),
        value: "密码",
        style: {
          ...defaultComponentStyle_0,
          width: 30,
          height: 30,
          borderRadius: "0%",
          borderStyle: "none",
          borderWidth: "0",
          borderColor: "#ffffff00",
          transform: 0,
          animationName: "",
          boxSizing: "border-box",
          lineHeight: "30px",
          fontSize: 12,
          fontWeight: "normal",
          textDecoration: "none",
          color: "#000",
          backgroundColor: "#ffffff00",
          textAlign: "left",
          wordSpacing: "10px",
        },
      },
      {
        // input
        type: isFormComponent_Input,
        key: getOnlyKey(),
        formItemName: "password", // form item key
        inputType: "password",
        value: "",
        placeholder: "请输入",
        style: {
          ...defaultComponentStyle_0,
          left: 30,
          width: 140,
          height: 30,
          lineHeight: "30px",
          fontSize: 12,
          fontWeight: "normal",
          textDecoration: "none",
          color: "#000",
          backgroundColor: "#ffffff00",
          textAlign: "left",
          wordSpacing: "10px",
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "#000",
          boxSizing: "border-box",
        },
      },
    ],
  },
  // 提交按钮
  {
    //  button
    type: isFormComponent_Button,
    key: getOnlyKey(),
    formItemName: "submit",
    value: "提交",
    desc: "提交按钮",
    style: {
      ...defaultComponentStyle,
      width: 150,
      height: 40,
      lineHeight: "40px",
      textAlign: "center",
      backgroundColor: "blue",
      borderStyle: "none",
      borderWidth: "0",
      borderColor: "#ffffff00",
      borderRadius: 36,
      fontSize: 18,
      fontWeight: "bold",
      color: "white",
    },
    onClick: {
      // post
      url: "http://clash-server.echoyore.tech" + loginEnd,
      afterSuccess: "pop", //url
      popMsg: "弹出提示语",
      link: "",
    },
  },
];

const FormSider = () => {
  const store = useEditStore();
  const { canvas } = store;

  const formKeys = canvas.content.formKeys || [];

  const selectedCmp = selectedSingleCmpSelector(store);
  const [selectedFormKey, setSelectedFormKey] = useState<string | undefined>(
    selectedCmp?.formKey
  );

  useEffect(() => {
    setSelectedFormKey(selectedCmp?.formKey);
  }, [selectedCmp?.formKey]);

  return (
    <div className={leftSideStyles.main}>

      <Item label="选择表单: " labelStyle={{ color: "red" }}>
        <Select
          options={[{ value: '1', label: '新建表单' }].concat(formKeys?.map(key => ({ value: key, label: key })))}
          value={selectedFormKey}
          onChange={setSelectedFormKey}
          style={{ width: 200 }} />
      </Item>

      <ul className={leftSideStyles.box}>
        {settings.map((item, index) => (
          <li
            draggable={true}
            key={"form" + index}
            className={leftSideStyles.item}
            onClick={() => {
              addCmp({ ...item, formKey: selectedFormKey as string } as any);
            }}
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "drag-cmp",
                JSON.stringify({
                  ...item,
                  formKey: selectedFormKey,
                })
              );
            }}
            style={{
              height: 60,
              lineHeight: "60px",
            }}>
            {item.desc}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FormSider;
