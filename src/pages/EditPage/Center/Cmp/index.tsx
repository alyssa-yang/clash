import { ICmpWithKey } from "src/store/editStoreTypes";
import styles from './index.module.less'
import { isImgComponent, isTextComponent } from "../../LeftSider";
import { Text, Img } from './CmpDetail'
import React, { memo } from "react";
import { omit, pick } from "lodash";
import classNames from "classnames";
import { setCmpSelected, setCmpsSelected } from "src/store/editStore";

interface ICmpProps { cmp: ICmpWithKey, index: number, isSelected: boolean }

const Cmp = memo((props: ICmpProps) => {
    const { cmp, index, isSelected } = props
    const { style } = cmp
    const setSelected = e => {
        if (e.metaKey) {
            setCmpsSelected([index])
        } else {
            setCmpSelected(index)
        }
    }

    //定位元素
    const outerStyle = pick(style, ['position', 'top', 'left', 'width', 'height'])
    const innerStyle = omit(style, ['position', 'top', 'left'])

    const transform = `rotate(${style.transform}deg)`;

    return (
        <div
            className={classNames(styles.main, isSelected && 'selectedBorder')}
            style={{ ...outerStyle, transform, zIndex: 9999 }}
            onClick={setSelected}
            id={`cmp${cmp.key}`}
        >
            <div className={styles.inner} style={{ ...innerStyle, zIndex: index }}>
                {cmp.type === isTextComponent && <Text {...cmp} />}
                {cmp.type === isImgComponent && <Img {...cmp} />}
            </div>
        </div>)

})

export default Cmp