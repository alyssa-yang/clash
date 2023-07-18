import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  EditStoreAction,
  EditStoreState,
  ICanvas,
  ICmp,
  ICmpWithKey,
  IEditStore,
  Style
} from './editStoreTypes'
import { getOnlyKey } from 'src/utils'
import Axios from 'src/request/axios'
import { getCanvasByIdEnd, saveCanvasEnd } from 'src/request/end'
import { enableMapSet } from 'immer'
import { resetZoom } from './zoomStore'
import { recordCanvasChangeHistory } from './historySlice'
import { cloneDeep } from 'lodash'
enableMapSet()

const useEditStore = create(
  immer<EditStoreState & EditStoreAction>(set => ({
    canvas: getDefaultCanvas(),
    //记录选中组件的下标
    assembly: new Set(),
    canvasChangeHistory: [{ canvas: getDefaultCanvas(), assembly: new Set() }],
    canvasChangeHistoryIndex: 0
  }))
)

//全部选中
export const setAllCmpSelected = () => {
  useEditStore.setState(draft => {
    const len = draft.canvas.cmps.length
    draft.assembly = new Set(Array.from({ length: len }, (a, b) => b))
  })
}
//选中多个
// 如果再次点击已经选中的组件，则取消选中
export const setCmpsSelected = (indexes: Array<number>) => {
  useEditStore.setState(draft => {
    if (indexes)
      indexes.forEach(index => {
        if (draft.assembly.has(index)) {
          // 取消这个组件的选中
          draft.assembly.delete(index)
        } else {
          // 选中
          draft.assembly.add(index)
        }
      })
  })
}
//选中单个
export const setCmpSelected = (index: number) => {
  if (index === -1) {
    useEditStore.setState(draft => {
      if (draft.assembly.size > 0) {
        draft.assembly.clear()
      }
    })
  } else if (index > -1) {
    useEditStore.setState(draft => {
      draft.assembly = new Set([index])
    })
  }
}
//修改选中的组件属性
export const updateAssemblyCmpsByDistance = (newStyle: {
  [key: string]: number
}) => {
  useEditStore.setState(draft => {
    draft.assembly.forEach(index => {
      const cmp = { ...draft.canvas.cmps[index] }
      let invalid = false
      for (const key in newStyle) {
        if (
          (key === 'width' || key === 'height') &&
          cmp.style[key] + newStyle[key] < 2
        ) {
          invalid = true
          break
        }
        cmp.style[key] += newStyle[key]
      }
      if (!invalid) {
        draft.canvas.cmps[index] = cmp
      }
    })
  })
}
//修改单个组件的样式
export const updateSelectedCmpStyle = (newStyle: Style) => {
  useEditStore.setState(draft => {
    Object.assign(
      draft.canvas.cmps[selectedCmpIndexSelector(draft)].style,
      newStyle
    )
    recordCanvasChangeHistory(draft)
  })
}

//修改单个组件的属性 value、onClick
export const updateSelectedCmpAttr = (key: string, value: any) => {
  useEditStore.setState(draft => {
    const selectedIndex = selectedCmpIndexSelector(draft)
    draft.canvas.cmps[selectedIndex][key] = value
    recordCanvasChangeHistory(draft)
  })
}
export const editAssemblyStyle = (newStyle: Style) => {
  useEditStore.setState(draft => {
    draft.assembly.forEach((index: number) => {
      const _s = { ...draft.canvas.cmps[index].style }
      const canvasStyle = draft.canvas.style
      if (newStyle.right === 0) {
        //left
        _s.left = canvasStyle.width - _s.width
      } else if (newStyle.bottom === 0) {
        //top
        _s.top = canvasStyle.height - _s.height
      } else if (newStyle.left === 'center') {
        _s.left = (canvasStyle.width - _s.width) / 2
      } else if (newStyle.top === 'center') {
        _s.top = (canvasStyle.height - _s.height) / 2
      } else {
        Object.assign(_s, newStyle)
      }
      draft.canvas.cmps[index].style = _s

      recordCanvasChangeHistory(draft)
    })
  })
}
// 选中的单个组件的index
export const selectedCmpIndexSelector = (store: IEditStore): number => {
  const selectedCmpIndex = Array.from(store.assembly)[0]
  return selectedCmpIndex === undefined ? -1 : selectedCmpIndex
}
export const clearCanvas = () => {
  useEditStore.setState(draft => {
    draft.canvas = getDefaultCanvas()
    draft.assembly.clear()
    recordCanvasChangeHistory(draft)
  })
  resetZoom()
}
//添加组件
export const addCmp = (_cmp: ICmp) => {
  useEditStore.setState(draft => {
    draft.canvas.cmps.push({ ..._cmp, key: getOnlyKey() })
    draft.assembly = new Set([draft.canvas.cmps.length - 1])
    recordCanvasChangeHistory(draft)
  })
}
//删除组件
export const delSelectedCmps = () => {
  useEditStore.setState(draft => {
    const assembly = draft.assembly
    draft.canvas.cmps = draft.canvas.cmps.filter(
      (_, index) => !assembly.has(index)
    )
    draft.assembly.clear()
    recordCanvasChangeHistory(draft)
  })
}
//复制组件
export const copyAssemblyCmps = () => {
  useEditStore.setState(draft => {
    const newCmps: Array<ICmpWithKey> = []
    const cmps = draft.canvas.cmps
    const newAssembly: Set<number> = new Set()
    let i = cmps.length
    draft.assembly.forEach(index => {
      const cmp = cmps[index]
      const newCmp = cloneDeep(cmp)
      newCmp.key = getOnlyKey()
      newCmp.style.left += 40
      newCmp.style.top += 40
      newCmps.push(newCmp)
      newAssembly.add(i++)
    })
    draft.assembly = newAssembly
    draft.canvas.cmps = draft.canvas.cmps.concat(newCmps)
    recordCanvasChangeHistory(draft)
  })
}
//上移一层
export const addZIndex = () => {
  useEditStore.setState(draft => {
    const cmps = draft.canvas.cmps
    const selectedIndex = selectedCmpIndexSelector(draft)
    if (selectedIndex === cmps.length - 1) {
      return
    } else {
      ;[cmps[selectedIndex], cmps[selectedIndex + 1]] = [
        cmps[selectedIndex + 1],
        cmps[selectedIndex]
      ]
      draft.assembly = new Set([selectedIndex + 1])

      recordCanvasChangeHistory(draft)
    }
  })
}
//下移一层
export const subZIndex = () => {
  useEditStore.setState(draft => {
    const cmps = draft.canvas.cmps
    const selectedIndex = selectedCmpIndexSelector(draft)
    if (selectedIndex === 0) {
      return
    } else {
      ;[cmps[selectedIndex - 1], cmps[selectedIndex]] = [
        cmps[selectedIndex],
        cmps[selectedIndex - 1]
      ]
      draft.assembly = new Set([selectedIndex - 1])

      recordCanvasChangeHistory(draft)
    }
  })
}
//置顶
export const topZIndex = () => {
  useEditStore.setState(draft => {
    const cmps = draft.canvas.cmps
    const selectedIndex = selectedCmpIndexSelector(draft)
    if (selectedIndex === cmps.length - 1) {
      return
    } else {
      draft.canvas.cmps = cmps
        .slice(0, selectedIndex)
        .concat(cmps.slice(selectedIndex + 1))
        .concat(cmps[selectedIndex])
      draft.assembly = new Set([cmps.length - 1])

      recordCanvasChangeHistory(draft)
    }
  })
}
//置底
export const bottomZIndex = () => {
  useEditStore.setState(draft => {
    const cmps = draft.canvas.cmps
    const selectedIndex = selectedCmpIndexSelector(draft)
    if (selectedIndex === 0) {
      return
    } else {
      draft.canvas.cmps = [cmps[selectedIndex]]
        .concat(cmps.slice(0, selectedIndex))
        .concat(cmps.slice(selectedIndex + 1))

      draft.assembly = new Set([0])

      recordCanvasChangeHistory(draft)
    }
  })
}
export const saveCanvas = async (
  id: number | null,
  type: string,
  successCallback: (id: number) => void
) => {
  const canvas = useEditStore.getState().canvas
  const res: any = await Axios.post(saveCanvasEnd, {
    id,
    title: canvas.title,
    content: JSON.stringify(canvas),
    type
  })
  successCallback(res?.id)
}

export const fetchCanvas = async (id: number) => {
  const res: any = await Axios.get(getCanvasByIdEnd + id)
  if (res) {
    useEditStore.setState(draft => {
      draft.canvas = JSON.parse(res.content)
      draft.canvas.title = res.title
      draft.assembly.clear()
      //初始化历史数据
      draft.canvasChangeHistory = [
        {
          canvas: draft.canvas,
          assembly: draft.assembly
        }
      ]
      draft.canvasChangeHistoryIndex = 0
    })
  }

  resetZoom()
}

export const updateCanvasStyle = (newStyle: { [key: string]: any }) => {
  useEditStore.setState(draft => {
    const style = {
      ...draft.canvas.style,
      ...newStyle
    }
    draft.canvas.style = style
    recordCanvasChangeHistory(draft)
  })
}
export const recordCanvasChangeHistory_2 = () => {
  const store = useEditStore.getState()
  if (
    store.canvas ===
    store.canvasChangeHistory[store.canvasChangeHistoryIndex].canvas
  ) {
    return
  }

  useEditStore.setState(draft => {
    recordCanvasChangeHistory(draft)
  })
}

export const updateCanvasTitle = (title: string) => {
  useEditStore.setState(draft => {
    draft.canvas.title = title
    recordCanvasChangeHistory(draft)
  })
}
export default useEditStore

function getDefaultCanvas (): ICanvas {
  return {
    title: '未命名',
    style: {
      width: 320,
      height: 568,
      backgroundColor: '#fff',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    },
    cmps: []
  }
}
