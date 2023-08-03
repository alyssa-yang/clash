import classNames from "classnames";
import { memo, useState, useEffect } from "react";
import styles from "./index.module.less";
import TextSider from "./TextSider";
import ImgSider from "./ImgSider";
import GraphSider from "./GraphSider";
import { isImgComponent, isTextComponent, isGraphComponent, isFormComponent } from "src/utils/const";
import TemplateSider from "./TemplateSider";
import FormSider from "./FormSider";

export const isTemplate = 0;

const LeftSider = memo(() => {
    const [showSide, setShowSide] = useState(-1);

    const _setShowSide = (which: number | undefined) => {
        if (showSide === which) {
            setShowSide(-1);
        } else {
            setShowSide(which ?? -1);
        }
    };

    useEffect(() => {
        const cancelShow = () => setShowSide(-1);
        document.getElementById("center")?.addEventListener("click", cancelShow);
        return () => {
            document
                .getElementById("center")
                ?.removeEventListener("click", cancelShow);
        };
    }, []);

    console.log("left render"); //sy-log

    return (
        <div className={styles.main}>
            <ul className={styles.cmps}>
                <li
                    className={classNames(
                        styles.cmp,
                        showSide === isTemplate ? styles.selected : ""
                    )}
                    onClick={() => _setShowSide(isTemplate)}>
                    <i className={classNames("iconfont icon-mobankuangjia-xianxing", styles.cmpIcon)} />
                    <span className={styles.cmpText}>模版</span>
                </li>
                <li
                    className={classNames(
                        styles.cmp,
                        showSide === isTextComponent ? styles.selected : ""
                    )}
                    onClick={() => _setShowSide(isTextComponent)}>
                    <i className={classNames("iconfont icon-wenben", styles.cmpIcon)} />
                    <span className={styles.cmpText}>文本</span>
                </li>
                <li
                    className={classNames(
                        styles.cmp,
                        showSide === isImgComponent ? styles.selected : ""
                    )}
                    onClick={() => _setShowSide(isImgComponent)}>
                    <i className={classNames("iconfont icon-tupian", styles.cmpIcon)} />
                    <span className={styles.cmpText}>图片</span>
                </li>
                <li
                    className={classNames(
                        styles.cmp,
                        showSide === isGraphComponent ? styles.selected : ""
                    )}
                    onClick={() => _setShowSide(isGraphComponent)}>
                    <i
                        className={classNames("iconfont icon-graphical", styles.cmpIcon)}
                    />
                    <span className={styles.cmpText}>图形</span>
                </li>
                <li
                    className={classNames(
                        styles.cmp,
                        showSide === isFormComponent ? styles.selected : ""
                    )}
                    onClick={() => _setShowSide(isFormComponent)}>
                    <i className={classNames("iconfont icon-zidingyibiaodan", styles.cmpIcon)} />
                    <span className={styles.cmpText}>表单</span>
                </li>
            </ul>
            {showSide === isTemplate && <TemplateSider />}
            {showSide === isTextComponent && <TextSider />}
            {showSide === isImgComponent && <ImgSider />}
            {showSide === isGraphComponent && <GraphSider />}
            {showSide === isFormComponent && <FormSider />}
        </div>
    );
});

export default LeftSider;
