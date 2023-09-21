import { Form, Input, Select } from "antd";
import { updateSelectedCmpStyle, updateSelectedCmpAttr, editAssemblyStyle } from "src/store/editStore";
import { ICmpWithKey, Style } from "src/store/editStoreTypes";
import EditCmpStyle from "./EditCmpStyle";

export default function EditCmp({ selectedCmp, formKeys }: { selectedCmp: ICmpWithKey, formKeys: string[] }) {
    const { value, style, onClick = '', formItemName, alignPage } = selectedCmp

    return <div>
        <Form
            initialValues={{
                ...style,
                borderRadius: style.borderRadius && typeof style.borderRadius === 'string' ? style.borderRadius?.substring(0, style.borderRadius.length - 2) : '',
                lineHeight: style.lineHeight && typeof style.lineHeight === 'string' ? style.lineHeight?.substring(0, style.lineHeight.length - 2) : '',
                value,
                alignPage,
                onClick
            }}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 20 }}
            labelWrap
            labelAlign="left"
            onValuesChange={(values) => {
                const key = Object.keys(values)[0]
                const value = Object.values(values)[0] as any
                if (key === 'lineHeight' || key === "borderRadius") {
                    updateSelectedCmpStyle({ [key]: `${value}px` })
                } else if (['backgroundColor', 'color', 'borderColor'].includes(key)) {
                    console.log('value.toHexString() ', value.toHexString())
                    updateSelectedCmpStyle({ [key]: value.toHexString() })
                } else if (key === 'onClick') {
                    updateSelectedCmpAttr(key, value)
                } else if (key === 'alignPage') {
                    const newStyle: Style = {}
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
                    updateSelectedCmpAttr(key, value)
                } else if (['fontWeight', 'textDecoration', 'textAlign', 'borderStyle'].includes(key)) {
                    updateSelectedCmpStyle({ [key]: value })
                } else if (key === 'animationName') {
                    const styleObj = {
                        animationName: value as string,
                        animationIterationCount: style.animationIterationCount ?? 1,
                        animationDuration: `${style.animationDuration ?? 1}s`,
                        animationDelay: `${style.animationDelay ?? 0}s`,
                        animationPlayState: 'running'
                    }
                    updateSelectedCmpStyle(styleObj)
                } else if (key === 'animationIterationCount') {
                    updateSelectedCmpStyle({ [key]: value === 999 ? 'infinite' : value })
                } else if (key === 'animationDuration' || key === 'animationDelay') {
                    updateSelectedCmpStyle({ [key]: `${value}s` })
                } else {
                    updateSelectedCmpStyle({ [key]: value - 0 })
                }
            }}>
            {formItemName && <>
                <Form.Item label="所属表单" name="formKey">
                    <Select options={formKeys?.map(key => ({ value: key, label: key }))} />
                </Form.Item>
                <Form.Item label="form字段" name="formItemName">
                    <Input />
                </Form.Item>
            </>}
            <Form.Item label="对齐页面" name="alignPage">
                <Select options={[
                    { value: 'left', label: '左对齐' },
                    { value: 'right', label: '右对齐' },
                    { value: 'x-center', label: '水平居中' },
                    { value: 'top', label: '上对齐' },
                    { value: 'bottom', label: '下对齐' },
                    { value: 'y-center', label: '垂直居中' }]} />
            </Form.Item>
            <EditCmpStyle
                value={value}
                styleName="style"
                styleValue={style}
                onClick={onClick}
            />
            {/* {selectedCmp.type === isImgComponent &&
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
            <Item label="动画名称" name="animationName">
                <Select options={[
                    { value: 'none', label: '无动画' },
                    { value: 'toggle', label: '闪烁' },
                    { value: 'jello', label: '果冻' },
                    { value: 'shake', label: '抖动' },
                    { value: 'wobble', label: '左右摇摆' }]} />
            </Item>
            {style.animationName && <>
                <Item label="动画持续时长" name="animationDuration" >
                    <InputNumber precision={1} min={1} addonAfter="s" />
                </Item>
                <Item label="动画延迟时间" name="animationDelay" >
                    <InputNumber precision={1} min={1} addonAfter="s" />
                </Item>
                <Item label="动画循环次数" name="animationIterationCount" help="999代表无数次" >
                    <InputNumber precision={0} min={1} />
                </Item>
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            const value = style.animationName
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
            </>} */}
        </Form>
    </div >


}