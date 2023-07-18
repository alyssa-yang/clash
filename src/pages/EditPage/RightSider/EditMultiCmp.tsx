import { Form, Select } from "antd";
import styles from './index.module.less'
import { editAssemblyStyle } from "src/store/editStore";
const { Item } = Form

export default function EditMultiCmp() {
    return <div className={styles.main}>
        <Form
            wrapperCol={{ span: 20, offset: 2 }}
            labelAlign="left" onValuesChange={(values) => {
                const key = Object.keys(values)[0]
                const value = Object.values(values)[0] as any
                if (key === 'alignPage') {
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
                }
            }}>

            <Item label="对齐页面" name="alignPage">
                <Select options={[
                    { value: 'left', label: '左对齐' },
                    { value: 'right', label: '右对齐' },
                    { value: 'x-center', label: '水平居中' },
                    { value: 'top', label: '上对齐' },
                    { value: 'bottom', label: '下对齐' },
                    { value: 'y-center', label: '垂直居中' }]} />
            </Item>

        </Form>
    </div >


}