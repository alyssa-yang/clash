import { ColorPicker, Form, Input, InputNumber, Select } from "antd";
import styles from './index.module.less'
import { updateSelectedCmpStyle, updateSelectedCmpAttr, editAssemblyStyle } from "src/store/editStore";
import { ICmpWithKey } from "src/store/editStoreTypes";
import { isImgComponent, isTextComponent } from "../LeftSider";
const { Item } = Form

export default function EditCmp({ selectedCmp }: { selectedCmp: ICmpWithKey }) {
    const { value, style, onClick = () => { } } = selectedCmp

    console.log(selectedCmp)
    return <div className={styles.main}>
        <Form
            initialValues={{
                ...style,
                value,
                onClick
            }}
            wrapperCol={{ span: 20, offset: 2 }}
            labelAlign="left" onValuesChange={(values) => {
                const key = Object.keys(values)[0]
                const value = Object.values(values)[0] as any
                if (key === 'lineHeight') {
                    updateSelectedCmpStyle({ [key]: `${value}px` })
                } else if (['backgroundColor', 'color', 'border'].includes(key)) {
                    updateSelectedCmpStyle({ [key]: value.toHexString() })
                } else if (key === 'onClick') {
                    updateSelectedCmpAttr(key, value)
                } else if (key === 'alignPage') {
                    const newStyle = {}
                    switch (value) {
                        case 'left':
                            newStyle.left = 0;
                            break;
                        case 'right':
                            newStyle.right = 0;
                            break;
                        case 'x-center':
                            newStyle.left = 'center';
                            break;
                        case 'top':
                            newStyle.top = 0;
                            break;
                        case 'bottom':
                            newStyle.bottom = 0;
                            break;
                        case 'y-center':
                            newStyle.top = 'center';
                            break;
                    }
                    editAssemblyStyle(newStyle)
                } else if (['fontWeight', 'textDecoration', 'textAlign', 'borderStyle'].includes(key)) {
                    updateSelectedCmpStyle({ [key]: value })
                } else {
                    updateSelectedCmpStyle({ [key]: value - 0 })
                }
            }}>
            {selectedCmp.type === isImgComponent &&
                <Item label="描述" name="value">
                    <Input />
                </Item>}
            {selectedCmp.type === isTextComponent && <>
                <Item label="字体大小" name="fontSize">
                    <Input />
                </Item>
                <Item label="字体粗细" name="fontWeight">
                    <Select options={[
                        { value: 'normal', label: 'normal' },
                        { value: 'bold', label: 'bold' },
                        { value: 'lighter', label: 'lighter' }]} />
                </Item>
                <Item label="字体行高" name="lineHeight">
                    <Input />
                </Item>
                <Item label="装饰线" name="textDecoration">
                    <Select options={[{ value: 'none', label: '无' },
                    { value: 'underline', label: '下划线' },
                    { value: 'overline', label: '上划线' },
                    { value: 'line-through', label: '删除线' }]} />
                </Item>
                <Item label="对齐" name="textAlign">
                    <Select options={[
                        { value: 'left', label: '居左' },
                        { value: 'center', label: '居中' },
                        { value: 'right', label: '居右' }]} />

                </Item>
            </>}
            <Item label="对齐页面" name="alignPage">
                <Select options={[
                    { value: 'left', label: '左对齐' },
                    { value: 'right', label: '右对齐' },
                    { value: 'x-center', label: '水平居中' },
                    { value: 'top', label: '上对齐' },
                    { value: 'bottom', label: '下对齐' },
                    { value: 'y-center', label: '垂直居中' }]} />
            </Item>
            <Item label="旋转" name="transform">
                <Input />
            </Item>
            <Item label="圆角" name="borderRadius">
                <Input />
            </Item>
            <Item label="边框样式" name="borderStyle">
                <Select options={[
                    { value: 'none', label: 'none' },
                    { value: 'dashed', label: 'dashed' },
                    { value: 'dotted', label: 'dotted' },
                    { value: 'double', label: 'double' },
                    { value: 'groove', label: 'groove' },
                    { value: 'hidden', label: 'hidden' },
                    { value: 'solid', label: 'solid' }]} />
            </Item>
            <Item label="边框宽度" name="borderWidth">
                <Input />
            </Item>
            <Item label="边框颜色" name="borderColor">
                <ColorPicker format="hex" placement="bottomLeft" showText />
            </Item>
            <Item label="字体颜色" name="color">
                <ColorPicker format="hex" placement="bottomLeft" showText />
            </Item>
            <Item label="背景颜色" name="backgroundColor">
                <ColorPicker format="hex" placement="bottomLeft" showText />
            </Item>
            <Item label="点击跳转" name="onClick">
                <Input />
            </Item>
        </Form>
    </div >


}