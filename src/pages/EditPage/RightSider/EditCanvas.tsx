import { ColorPicker, Form, Input, InputNumber } from "antd";
import { updateCanvasTitle, updateCanvasStyle } from "src/store/editStore";
import { ICanvas } from "src/store/editStoreTypes";
import { useEffect } from "react";
const { Item } = Form

export default function EditCanvas({ canvas }: { canvas: ICanvas }) {
    const [form] = Form.useForm();
    const style = canvas.content.style;

    useEffect(() => {
        form.setFieldsValue({
            ...style,
            title: canvas.title
        })
    }, [canvas])

    return <div>
        <Form
            form={form}
            initialValues={{
                ...style,
                title: canvas.title
            }}
            wrapperCol={{ span: 20, offset: 2 }}
            labelAlign="left" onValuesChange={(value) => {
                if (Object.keys(value)[0] === 'title') {
                    updateCanvasTitle(Object.values(value)[0] as string)
                } else if (Object.keys(value)[0] === 'backgroundColor') {
                    updateCanvasStyle({ 'backgroundColor': Object?.values(value as Object)[0].toHexString() })
                } else {
                    updateCanvasStyle(value)
                }
            }}>
            <Item label="标题" name="title">
                <Input />
            </Item>
            <Item label="画布宽度(px)" name="width" >
                <InputNumber min={100} placeholder="min=100" width={150} />
            </Item>
            <Item label="画布高度(px)" name="height">
                <InputNumber min={100} placeholder="min=100" />
            </Item>
            <Item label="背景颜色" name="backgroundColor">
                <ColorPicker format="hex" placement="bottomLeft" showText />
            </Item>
            <Item label="背景图片" name="img">
                <Input />
            </Item>
        </Form>
    </div >


}