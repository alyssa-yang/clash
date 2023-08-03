import Line from "src/components/Line"
import { Style } from "src/store/editStoreTypes"


interface AlignLinesProps {
    canvasStyle: Style
}
export default function AlignLines({ canvasStyle }: AlignLinesProps) {
    return (<>
        {/* 中心X轴 */}
        <Line
            id="centerXLine"
            style={{
                top: canvasStyle.height / 2,
                left: 0,
                width: canvasStyle.width,
                backgroundColor: 'red'
            }}
        />
        {/* 中心Y轴 */}
        <Line
            id="centerYLine"
            style={{
                top: 0,
                left: canvasStyle.width / 2,
                height: canvasStyle.height,
                backgroundColor: 'red'
            }}
        />
        <Line
            id="canvasLineTop"
            style={{
                top: 0,
                left: 0,
                width: canvasStyle.width,
                backgroundColor: 'red'
            }}
        />
        <Line
            id="canvasLineRight"
            style={{
                top: 0,
                right: 0,
                height: canvasStyle.height,
                backgroundColor: 'red'
            }}
        />

        <Line
            id="canvasLineBottom"
            style={{
                bottom: 0,
                left: 0,
                width: canvasStyle.width,
                backgroundColor: 'red'
            }}
        />
        <Line
            id="canvasLineLeft"
            style={{
                bottom: 0,
                left: 0,
                height: canvasStyle.height,
                backgroundColor: 'red'
            }}
        />
        {/* 对齐组件 */}
        <Line id="lineTop" />
        <Line id="lineBottom" />
        <Line id="lineLeft" />
        <Line id="lineRight" />
        <Line id="lineX" />
        <Line id="lineY" />
    </>)
}