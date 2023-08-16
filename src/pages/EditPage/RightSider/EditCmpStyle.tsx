import { Button, ColorPicker, Form, Input, InputNumber, Select, Space } from "antd";
import { updateSelectedCmpStyle } from "src/store/editStore";
import { Style } from "src/store/editStoreTypes";
const { Item } = Form

interface Props {
    value?: string;
    placeholder?: string;
    inputType?: string;
    onClick?:
    | string
    | {
        url: string;
        afterSuccess: "pop" | "url";
        popMsg?: string;
        link?: string;
    };
    styleName: string;
    styleValue: Style;
    label?: string;
}


export default function EditCmpStyle({
    value,
    placeholder,
    inputType,
    onClick,
    styleName,
    styleValue,
    label,
}: Props) {

    return <div>
        {value ? <>
            {value && <Item label="描述" name="value">
                <Input />
            </Item>}
            {label && <Item label="标签" name="label">
                <Input />
            </Item>}
            {placeholder && <Item label="提示输入" name="placeholder">
                <Input />
            </Item>}
            {inputType && <Item label="文本类型" name="inputType">
                <Select options={[
                    { value: 'text', label: '文本' },
                    { value: 'number', label: '数字' },
                    { value: 'password', label: '密码' },
                    { value: 'date', label: '日期' },
                    { value: 'checkbox', label: 'checkbox' }]} />
            </Item>}
        </> : null}

        {/* 字体 */}
        {styleValue.fontSize ? <>
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
            <Item label="字体颜色" name="color">
                <ColorPicker format="hex" placement="bottomLeft" showText />
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
        </> : null}

        {/* <Item label="对齐页面" name="alignPage">
            <Select options={[
                { value: 'left', label: '左对齐' },
                { value: 'right', label: '右对齐' },
                { value: 'x-center', label: '水平居中' },
                { value: 'top', label: '上对齐' },
                { value: 'bottom', label: '下对齐' },
                { value: 'y-center', label: '垂直居中' }]} />
        </Item> */}


        {styleValue.borderStyle ? <>
            <Item label="边框样式" name="borderStyle">
                <Select options={[
                    { value: 'none', label: 'none' },
                    { value: 'solid', label: 'solid' },
                    { value: 'dashed', label: 'dashed' },
                    { value: 'dotted', label: 'dotted' },
                    { value: 'double', label: 'double' },
                    { value: 'groove', label: 'groove' },
                    { value: 'hidden', label: 'hidden' }]} />
            </Item>
            <Item label="边框宽度" name="borderWidth">
                <Input />
            </Item>
            <Item label="边框颜色" name="borderColor">
                <ColorPicker placement="bottomLeft" showText />
            </Item>
            <Item label="圆角" name="borderRadius">
                <Input />
            </Item>
            <Item label="背景颜色" name="backgroundColor">
                <ColorPicker format="hex" placement="bottomLeft" showText />
            </Item>
        </> : null}

        {/* 旋转 */}
        {styleValue.transform ? <>
            <Item label="旋转" name="transform">
                <Input />
            </Item>

            <Item label="动画名称" name="animationName">
                <Select options={[
                    { value: 'none', label: '无动画' },
                    { value: 'toggle', label: '闪烁' },
                    { value: 'jello', label: '果冻' },
                    { value: 'shake', label: '抖动' },
                    { value: 'wobble', label: '左右摇摆' }]} />
            </Item>
        </> : null}

        {styleValue.animationName ? <>
            <Item label="动画持续时长" name="animationDuration" >
                <InputNumber precision={1} min={1} addonAfter="s" />
            </Item>
            <Item label="动画延迟时间" name="animationDelay" >
                <InputNumber precision={1} min={1} addonAfter="s" />
            </Item>
            <Item label="动画循环次数" name="animationIterationCount" help="999代表无数次" >
                <InputNumber precision={0} min={1} />
            </Item>
            <Space style={{ marginBottom: 8 }}>
                <Button
                    type="primary"
                    onClick={() => {
                        const value = styleValue.animationName
                        updateSelectedCmpStyle({ animationName: '' })
                        setTimeout(() => {
                            updateSelectedCmpStyle({ animationName: value, animationPlayState: 'running' })
                        }, 0)
                    }}>重新演示动画</Button>
                <Button
                    type="primary"
                    onClick={() => {
                        updateSelectedCmpStyle({ animationPlayState: 'paused' })
                    }}>暂停演示动画</Button>
            </Space>
        </> : null}

        {typeof onClick === "object" ?
            <>
                <Item label="post地址" name="url" >
                    <Input />
                </Item>
                <Item label="成功事件" name="afterSuccess" >
                    <Select options={[
                        { value: 'pop', label: '弹窗提示' },
                        { value: 'url', label: '跳转链接' }]} />
                </Item>
                <Item label="弹窗提示" name="popMsg" >
                    <Input />
                </Item>
                <Item label="跳转链接" name="link" >
                    <Input />
                </Item>
            </> :
            <Item label="点击跳转" name="onClick">
                <Input />
            </Item>
        }
    </div >


}