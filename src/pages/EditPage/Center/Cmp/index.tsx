import { ICmpWithKey } from "src/store/editStoreTypes";
import styles from './index.module.less'
import { isFormComponent_Button, isFormComponent_Input, isImgComponent, isTextComponent } from "src/utils/const";

import { Text, Img, Input, Button } from './CmpDetail'
import { memo } from "react";
import { omit, pick } from "lodash";
import classNames from "classnames";
import { getCmpGroupIndex, setCmpSelected, setCmpsSelected } from "src/store/editStore";

interface ICmpProps { cmp: ICmpWithKey, index: number, isSelected: boolean }

const Cmp = memo((props: ICmpProps) => {
    const { cmp, index } = props
    const { style } = cmp
    const setSelected = e => {
        if (e.metaKey) {
            setCmpsSelected([index])
        } else {
            // 如果这个组件属于组合组件，那么默认选中组合组件
            const groupIndex = getCmpGroupIndex(index);
            setCmpSelected(groupIndex != undefined ? groupIndex : index);
        }
    }

    //定位元素
    const outerStyle = pick(style, ['position', 'top', 'left', 'width', 'height'])
    const innerStyle = omit(style, ['position', 'top', 'left'])

    const transform = `rotate(${style.transform}deg)`;

    return (
        <div
            className={classNames(styles.main)}
            style={{ ...outerStyle, transform, zIndex: index, animationPlayState: 'running' }}
            onClick={setSelected}
            id={`cmp${cmp.key}`}
        >
            <div className={styles.inner} style={{ ...innerStyle, zIndex: index }}>
                {cmp.type === isTextComponent && <Text {...cmp} />}
                {cmp.type === isImgComponent && <Img {...cmp} />}
                {cmp.type === isFormComponent_Input && <Input {...cmp} />}
                {cmp.type === isFormComponent_Button && <Button value={cmp.value} />}
            </div>
        </div>)

})

export default Cmp
