import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  EditStoreAction,
  EditStoreState,
  ICmp,
  ICmpWithKey,
  IContent,
  IEditStore,
  Style
} from './editStoreTypes'
import { computeBoxStyle, getOnlyKey } from 'src/utils'
import Axios from 'src/request/axios'
import { getCanvasByIdEnd, saveCanvasEnd } from 'src/request/end'
import { resetZoom } from './zoomStore'
import { recordCanvasChangeHistory } from './historySlice'
import { cloneDeep } from 'lodash'
import { isCmpInView } from 'src/utils/isCmpInView'
import {
  defaultComponentStyle_0,
  isFormComponent,
  isGroupComponent
} from 'src/utils/const'

const showDiff = 12
const adjustDiff = 3

const useEditStore = create(
  immer<EditStoreState & EditStoreAction>(() => ({
    canvas: {
      id: null,
      title: '未命名',
      type: 'content',
      content: getDefaultCanvasContent()
    },

    hasSavedCanvas: true, // 画布编辑后是否被保存
    // 记录选中组件的下标
    assembly: new Set(),

    // 历史
    canvasChangeHistory: [
      {
        canvas: {
          id: null,
          title: '未命名',
          type: 'content',
          content: getDefaultCanvasContent()
        },
        assembly: new Set()
      }
    ],
    canvasChangeHistoryIndex: 0
  }))
)

// 初始化
export const initCanvas = () => {
  useEditStore.setState(draft => {
    ;(draft.canvas = {
      id: null,
      title: '未命名',
      type: 'content',
      content: getDefaultCanvasContent()
    }),
      (draft.hasSavedCanvas = true) // 画布编辑后是否被保存
    // 记录选中组件的下标
    draft.assembly = new Set()

    // 历史
    ;(draft.canvasChangeHistory = [
      {
        canvas: {
          id: null,
          title: '未命名',
          type: 'content',
          content: getDefaultCanvasContent()
        },
        assembly: new Set()
      }
    ]),
      (draft.canvasChangeHistoryIndex = 0)
  })

  resetZoom()
}
//全部选中
export const setAllCmpSelected = () => {
  useEditStore.setState(draft => {
    const cmps = draft.canvas.content.cmps
    const len = cmps.length
    //存在组合组件时，需要过滤出去子组件
    const array = []
    for (let i = 0; i < len; i++) {
      if (cmps[i].groupKey) {
        continue
      } else {
        array.push(i)
      }
    }
    draft.assembly = new Set(array)
  })
}
//选中多个
// 如果再次点击已经选中的组件，则取消选中
export const setCmpsSelected = (indexes: Array<number>) => {
  useEditStore.setState(draft => {
    if (draft.assembly.size === 1) {
      const cmps = draft.canvas.content.cmps
      const selectedIndex = selectedCmpIndexSelector(draft)
      if (cmps[selectedIndex].groupKey) {
        draft.assembly = new Set([])
      }
    }

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

// 根据组合子组件index，返回父组件index
export const getCmpGroupIndex = (childIndex: number): undefined | number => {
  const store = useEditStore.getState()
  const cmps = cmpsSelector(store)
  const map = getCmpsMap(cmps)
  const groupIndex = map.get(cmps[childIndex].groupKey)
  return groupIndex as number
}

//修改选中的组件属性
export const updateAssemblyCmpsByDistance = (
  newStyle: {
    [key: string]: number
  },
  autoAjustment?: boolean
) => {
  useEditStore.setState(draft => {
    const { cmps } = draft.canvas.content
    const map = getCmpsMap(cmps)
    const newAssembly: Set<number> = new Set()

    draft.assembly.forEach(index => {
      const cmp = cmps[index]
      if (cmp.type & isGroupComponent) {
        cmp.groupCmpKeys?.forEach(key => newAssembly.add(map.get(key)))
      }
      newAssembly.add(index)
    })
    newAssembly.forEach(index => {
      const selectedCmp = { ...cmps[index] }
      let invalid = false
      for (const key in newStyle) {
        if (
          (key === 'width' || key === 'height') &&
          selectedCmp.style[key] + newStyle[key] < 2
        ) {
          invalid = true
          break
        }
        selectedCmp.style[key] += newStyle[key]
      }
      //检查自动调整
      if (draft.assembly.size === 1 && autoAjustment && !selectedCmp.groupKey) {
        //对齐画布或者组件
        autoAlignToCanvas(canvasStyleSelector(draft), selectedCmp)

        //对齐单个组件
        const cmps = cmpsSelector(draft)
        cmps.forEach((cmp, cmpIndex) => {
          //可视区域内的组件
          const inView = isCmpInView(cmp)

          // 如果选中的是组合组件，那么与它自己的子组件肯定不对齐
          // 如果是组合组件，不要和自己的子组件对齐
          if (
            cmpIndex !== index &&
            inView &&
            !(
              selectedCmp.type & isGroupComponent &&
              selectedCmp.key === cmp.groupKey
            )
          ) {
            autoAlignToCmp(cmp.style, selectedCmp)
          }
        })
      }
      if (!invalid) {
        draft.canvas.content.cmps[index] = selectedCmp
      }
      // 移动或者拉伸单个子组件之后，父组件的宽高和位置也会发生变化
      // 重新计算组合组件的位置和宽高
      // 如果group变动，那么其相关子节点的位置也要发生变化
      if (newAssembly.size === 1 && selectedCmp.groupKey) {
        const groupIndex = map.get(selectedCmp.groupKey)
        const group = cmps[groupIndex]
        const _newAssembly: Set<number> = new Set()
        group.groupCmpKeys?.forEach((key: string) => {
          _newAssembly.add(map.get(key))
        })

        Object.assign(group.style, computeBoxStyle(cmps, _newAssembly))
      }
    })
    draft.canvas.content.cmps = cmps
    draft.hasSavedCanvas = false
  })
}
//画布的对齐
export const autoAlignToCanvas = (
  canvasStyle: Style,
  selectedCmp: ICmpWithKey
) => {
  const selectedCmpStyle = selectedCmp.style
  // ! 中心X轴
  //组件中心点离原点较近时出现
  autoAlign(
    selectedCmpStyle.top + selectedCmpStyle.height / 2 - canvasStyle.height / 2,
    'centerXLine',
    () => {
      selectedCmp.style.top = (canvasStyle.height - selectedCmpStyle.height) / 2
    }
  )
  // ! 中心Y轴
  //组件中心点离原点较近时出现
  autoAlign(
    selectedCmpStyle.left + selectedCmpStyle.width / 2 - canvasStyle.width / 2,
    'centerYLine',
    () => {
      selectedCmp.style.left = (canvasStyle.width - selectedCmpStyle.width) / 2
    }
  )
  // ! 对齐画布 top
  autoAlign(selectedCmpStyle.top, 'canvasLineTop', () => {
    selectedCmp.style.top = 0
  })

  // ! 对齐画布 bottom
  autoAlign(
    selectedCmpStyle.top + selectedCmp.style.height - canvasStyle.height,
    'canvasLineBottom',
    () => {
      selectedCmp.style.bottom = canvasStyle.height - selectedCmp.style.height
    }
  )

  // ! 对齐画布 left
  autoAlign(selectedCmpStyle.left, 'canvasLineLeft', () => {
    selectedCmp.style.left = 0
  })

  // ! 对齐画布 right
  autoAlign(
    selectedCmpStyle.left + selectedCmp.style.width - canvasStyle.width,
    'canvasLineRight',
    () => {
      selectedCmp.style.left = canvasStyle.width - selectedCmp.style.width
    }
  )
}
function autoAlign (
  _distance: number,
  domLineId: string,
  align: () => void,
  adjustDomLine?: (domLine: HTMLElement) => void
) {
  const distance = Math.abs(_distance)
  const domLine = document.getElementById(domLineId) as HTMLElement
  if (distance < showDiff) {
    //显示参考线
    domLine.style.display = 'block'
    if (adjustDomLine) {
      adjustDomLine(domLine)
    }
  }
  if (distance < adjustDiff) {
    //自动吸附
    align()
  }
}
//组件的对齐
export const autoAlignToCmp = (
  targetStyle: Style,
  selectedCmp: ICmpWithKey
) => {
  const selectedCmpStyle = selectedCmp.style

  let leftStyle: Style, rightStyle: Style
  if (targetStyle.left < selectedCmpStyle.left) {
    leftStyle = targetStyle
    rightStyle = selectedCmpStyle
  } else {
    leftStyle = selectedCmpStyle
    rightStyle = targetStyle
  }

  let topStyle: Style, bottomStyle: Style
  if (targetStyle.top < selectedCmpStyle.top) {
    topStyle = targetStyle
    bottomStyle = selectedCmpStyle
  } else {
    topStyle = selectedCmpStyle
    bottomStyle = targetStyle
  }

  // ! top top对齐
  autoAlign(
    targetStyle.top - selectedCmpStyle.top,
    'lineTop',
    () => {
      selectedCmp.style.top = targetStyle.top
    },
    domLine => {
      domLine.style.top = targetStyle.top + 'px'
      domLine.style.left = leftStyle.left + leftStyle.width / 2 + 'px'
      domLine.style.width =
        rightStyle.left +
        rightStyle.width / 2 -
        leftStyle.left -
        leftStyle.width / 2 +
        'px'
    }
  )
  // ! bottom top对齐
  autoAlign(
    targetStyle.top + targetStyle.height - selectedCmpStyle.top,
    'lineTop',
    () => {
      selectedCmp.style.top = targetStyle.top + targetStyle.height
    },
    domLine => {
      domLine.style.top = targetStyle.top + targetStyle.height - 1 + 'px'
      domLine.style.left = leftStyle.left + leftStyle.width / 2 + 'px'
      domLine.style.width =
        rightStyle.left +
        rightStyle.width / 2 -
        leftStyle.left -
        leftStyle.width / 2 +
        'px'
    }
  )

  // ! bottom bottom对齐
  autoAlign(
    targetStyle.top +
      targetStyle.height -
      selectedCmpStyle.top -
      selectedCmpStyle.height,
    'lineBottom',
    () => {
      selectedCmp.style.top =
        targetStyle.top + targetStyle.height - selectedCmpStyle.height
    },
    domLine => {
      domLine.style.top = targetStyle.top + targetStyle.height - 1 + 'px'
      domLine.style.left = leftStyle.left + leftStyle.width / 2 + 'px'
      domLine.style.width =
        rightStyle.left +
        rightStyle.width / 2 -
        leftStyle.left -
        leftStyle.width / 2 +
        'px'
    }
  )

  // ! top bottom对齐
  autoAlign(
    targetStyle.top - selectedCmpStyle.top - selectedCmpStyle.height,
    'lineBottom',
    () => {
      selectedCmp.style.top = targetStyle.top - selectedCmpStyle.height
    },
    domLine => {
      domLine.style.top = targetStyle.top + 'px'
      domLine.style.left = leftStyle.left + leftStyle.width / 2 + 'px'
      domLine.style.width =
        rightStyle.left +
        rightStyle.width / 2 -
        leftStyle.left -
        leftStyle.width / 2 +
        'px'
    }
  )

  // ! left left对齐
  autoAlign(
    targetStyle.left - selectedCmpStyle.left,
    'lineLeft',
    () => {
      selectedCmp.style.left = targetStyle.left
    },
    domLine => {
      domLine.style.top = topStyle.top + topStyle.height / 2 + 'px'
      domLine.style.left = targetStyle.left + 'px'
      domLine.style.height =
        bottomStyle.top +
        bottomStyle.height / 2 -
        topStyle.top -
        topStyle.height / 2 +
        'px'
    }
  )

  // ! left right对齐
  autoAlign(
    targetStyle.left + targetStyle.width - selectedCmpStyle.left,
    'lineRight',
    () => {
      selectedCmp.style.left = targetStyle.left + targetStyle.width
    },
    domLine => {
      domLine.style.top = topStyle.top + topStyle.height / 2 + 'px'
      domLine.style.left = targetStyle.left + targetStyle.width - 1 + 'px'
      domLine.style.height =
        bottomStyle.top +
        bottomStyle.height / 2 -
        topStyle.top -
        topStyle.height / 2 +
        'px'
    }
  )

  // ! right right对齐
  autoAlign(
    targetStyle.left +
      targetStyle.width -
      selectedCmpStyle.left -
      selectedCmpStyle.width,
    'lineRight',
    () => {
      selectedCmp.style.left =
        targetStyle.left + targetStyle.width - selectedCmpStyle.width
    },
    domLine => {
      domLine.style.top = topStyle.top + topStyle.height / 2 + 'px'
      domLine.style.left = targetStyle.left + targetStyle.width + 'px'
      domLine.style.height =
        bottomStyle.top +
        bottomStyle.height / 2 -
        topStyle.top -
        topStyle.height / 2 +
        'px'
    }
  )

  // ! right left 对齐
  autoAlign(
    targetStyle.left - selectedCmpStyle.left - selectedCmpStyle.width,
    'lineLeft',
    () => {
      selectedCmp.style.left = targetStyle.left - selectedCmpStyle.width
    },
    domLine => {
      domLine.style.left = targetStyle.left + 'px'
      domLine.style.top = topStyle.top + topStyle.height / 2 + 'px'
      domLine.style.height =
        bottomStyle.top +
        bottomStyle.height / 2 -
        topStyle.top -
        topStyle.height / 2 +
        'px'
    }
  )

  // ! 组件的中心 X 轴
  autoAlign(
    selectedCmpStyle.top +
      selectedCmpStyle.height / 2 -
      targetStyle.top -
      targetStyle.height / 2,
    'lineX',
    () => {
      selectedCmp.style.top =
        targetStyle.top + targetStyle.height / 2 - selectedCmpStyle.height / 2
    },
    domLine => {
      domLine.style.top = targetStyle.top + targetStyle.height / 2 + 'px'
      domLine.style.left = leftStyle.left + 'px'
      domLine.style.width =
        rightStyle.left + rightStyle.width - leftStyle.left + 'px'
    }
  )

  // ! 组件的中心 Y 轴
  autoAlign(
    selectedCmpStyle.left +
      selectedCmpStyle.width / 2 -
      targetStyle.left -
      targetStyle.width / 2,
    'lineY',
    () => {
      selectedCmp.style.left =
        targetStyle.left + targetStyle.width / 2 - selectedCmpStyle.width / 2
    },
    domLine => {
      domLine.style.left = targetStyle.left + targetStyle.width / 2 + 'px'

      domLine.style.top = topStyle.top + 'px'
      domLine.style.height =
        bottomStyle.top + bottomStyle.height - topStyle.top + 'px'
    }
  )
}
//修改单个组件的样式
export const updateSelectedCmpStyle = (
  newStyle: Style,
  recordHistory = true
) => {
  useEditStore.setState(draft => {
    const selectedIndex = selectedCmpIndexSelector(draft)
    if (!(typeof selectedIndex === 'number' && selectedIndex > -1)) {
      return
    }
    Object.assign(
      draft.canvas.content.cmps[selectedCmpIndexSelector(draft)].style,
      newStyle
    )
    if (recordHistory) {
      recordCanvasChangeHistory(draft)
    }
    draft.hasSavedCanvas = false
  })
}

//修改单个组件的属性 value、onClick
export const updateSelectedCmpAttr = (key: string, value: string | Object) => {
  useEditStore.setState((draft: any) => {
    const selectedIndex = selectedCmpIndexSelector(draft)
    if (typeof value === 'object') {
      Object.assign(draft.canvas.content.cmps[selectedIndex][key], value)
    } else {
      draft.canvas.content.cmps[selectedIndex][key] = value
    }
    draft.hasSavedCanvas = false
    recordCanvasChangeHistory(draft)
  })
}
//单个或多个组件的对齐页面
export const editAssemblyStyle = (newStyle: Style) => {
  useEditStore.setState(draft => {
    draft.assembly.forEach((index: number) => {
      const _s = { ...draft.canvas.content.cmps[index].style }
      const canvasStyle = draft.canvas.content.style
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
      draft.canvas.content.cmps[index].style = _s
      draft.hasSavedCanvas = false
      recordCanvasChangeHistory(draft)
    })
  })
}
// 选中的单个组件的index
export const selectedCmpIndexSelector = (store: IEditStore): number => {
  const selectedCmpIndex = Array.from(store.assembly)[0]
  return selectedCmpIndex === undefined ? -1 : selectedCmpIndex
}

// 仅用于选中单个组件
export const selectedSingleCmpSelector = (
  store: IEditStore
): ICmpWithKey | null => {
  const selectedCmpIndex = selectedCmpIndexSelector(store)
  const cmps = cmpsSelector(store)
  return selectedCmpIndex >= 0 ? cmps[selectedCmpIndex] : null
}

export const cmpsSelector = (store: IEditStore): Array<ICmpWithKey> =>
  store.canvas.content.cmps

export const canvasStyleSelector = (store: IEditStore): Style =>
  store.canvas.content.style

//清空画布
export const clearCanvas = () => {
  useEditStore.setState(draft => {
    draft.canvas.content = getDefaultCanvasContent()
    draft.assembly.clear()
    draft.hasSavedCanvas = false
    recordCanvasChangeHistory(draft)
  })
  resetZoom()
}
//添加组件
export const addCmp = (_cmp: ICmpWithKey) => {
  if (_cmp.type & isGroupComponent) {
    addGroup(_cmp)
    return
  }
  useEditStore.setState(draft => {
    draft.canvas.content.cmps.push({
      ..._cmp,
      key: getOnlyKey(),
      formKey: getStoreFormKey(draft, _cmp)
    })
    draft.assembly = new Set([draft.canvas.content.cmps.length - 1])
    draft.hasSavedCanvas = false
    recordCanvasChangeHistory(draft)
  })
}
//删除组件
export const delSelectedCmps = () => {
  useEditStore.setState(draft => {
    let { cmps, formKeys } = draft.canvas.content
    const map = getCmpsMap(cmps)
    const newAssembly: Set<number> = new Set()

    draft.assembly.forEach(index => {
      const cmp = cmps[index]
      if (cmp.type & isGroupComponent) {
        cmp.groupCmpKeys?.forEach(key => newAssembly.add(map.get(key)))
      }
      newAssembly.add(index)
    })

    //删除单个组件组件的子节点之后，需要调整父组件的位置和宽高
    if (newAssembly.size === 1) {
      const child: ICmpWithKey = cmps[Array.from(newAssembly)[0]]
      // child是要被删除的组件，所以要调整矩形，这个矩形的位置和宽高根据除child之外的组合子组件来计算
      if (child.groupKey) {
        const groupIndex = map.get(child.groupKey)
        const group = cmps[groupIndex]
        const _newAssembly: Set<number> = new Set()
        group.groupCmpKeys?.forEach(key => {
          if (key !== child.key) {
            _newAssembly.add(map.get(key))
          }
        })
        Object.assign(group.style, computeBoxStyle(cmps, _newAssembly))
      }
    }
    // 删除节点
    let hasFormDelete = false
    cmps = cmps.filter((cmp, index) => {
      const del = newAssembly.has(index)

      if (del) {
        //如果这个组件是组合子组件
        const groupkey = cmp.groupKey
        if (groupkey) {
          const groupIndex = map.get(groupkey)
          if (!newAssembly.has(groupIndex)) {
            const group = cmps[groupIndex]
            const s = new Set(group.groupCmpKeys)
            s.delete(cmp.key)
            group.groupCmpKeys = Array.from(s)
          }
        }
        if (cmp.type & isFormComponent) {
          hasFormDelete = true
        }
      }
      if (cmp.type & isGroupComponent) {
        const { groupCmpKeys } = cmp
        if ((groupCmpKeys?.length ?? 0) < 2) {
          //如果只有一个子组件了，那么没必要是组合组件了
          const singleCmpIndex = map.get(groupCmpKeys?.[0])
          cmps[singleCmpIndex].groupKey = undefined
        }
      }
      return !del
    })
    if (hasFormDelete) {
      // 更新formKeys
      const uselessFormKeys = new Set(formKeys) // 记录无用的formKey
      cmps.forEach(cmp => {
        const { formKey } = cmp
        if (formKey && uselessFormKeys.has(formKey)) {
          // 表单组件
          uselessFormKeys.delete(formKey)
        }
      })
      const newFormKeys = new Set(formKeys)
      newFormKeys.forEach(formKey => {
        if (uselessFormKeys.has(formKey)) {
          newFormKeys.delete(formKey)
        }
      })
      if (newFormKeys.size !== formKeys?.length) {
        draft.canvas.content.formKeys = Array.from(newFormKeys)
      }
    }
    draft.canvas.content.cmps = cmps
    draft.assembly.clear()
    draft.hasSavedCanvas = false
    recordCanvasChangeHistory(draft)
  })
}

function getStoreFormKey (store: EditStoreState, cmp: ICmpWithKey) {
  let { formKey } = cmp
  if (cmp.type & isFormComponent && !formKey) {
    formKey = getOnlyKey()
    if (!store.canvas.content.formKeys) {
      store.canvas.content.formKeys = []
    }

    store.canvas.content.formKeys.push(formKey)
  }

  return formKey
}
export function addGroup (group: any) {
  const { type, style, formKey } = group
  // 添加组合组件 | 表单组件
  useEditStore.setState(draft => {
    const groupCmp: ICmpWithKey = {
      type,
      key: getOnlyKey(),
      groupCmpKeys: [],
      style,
      formKey: getStoreFormKey(draft, group)
    }

    const groups: Array<ICmpWithKey> = []

    group.children.forEach((child: ICmp) => {
      const cmp: ICmpWithKey = {
        ...child,
        key: getOnlyKey(),
        formKey,
        groupKey: groupCmp.key,
        style: {
          ...child.style,
          top: child.style.top + style.top,
          left: child.style.left + style.left
        }
      }
      groups.push(cmp)
      groupCmp.groupCmpKeys?.push(cmp.key)
    })

    groups.push(groupCmp)

    draft.canvas.content.cmps = draft.canvas.content.cmps.concat(groups)
    draft.hasSavedCanvas = false
    draft.assembly = new Set([draft.canvas.content.cmps.length - 1])
    recordCanvasChangeHistory(draft)
  })
}
function getCopyCmp (cmp: ICmpWithKey) {
  const newCmp = cloneDeep(cmp)
  newCmp.key = getOnlyKey()
  newCmp.style.top += 40
  newCmp.style.left += 40
  return newCmp
}
//复制组件
export const copyAssemblyCmps = () => {
  useEditStore.setState(draft => {
    const newCmps: Array<ICmpWithKey> = []
    const cmps = draft.canvas.content.cmps
    const map = getCmpsMap(cmps)
    const newAssembly: Set<number> = new Set()
    let i = cmps.length
    draft.assembly.forEach(index => {
      const cmp = cmps[index]
      const newCmp = cloneDeep(cmp)
      newCmp.key = getOnlyKey()
      if (newCmp.type & isGroupComponent) {
        newCmp.groupCmpKeys = []
        // 子组件也复制
        cmp.groupCmpKeys?.forEach(key => {
          const childIndex = map.get(key)
          const child = cmps[childIndex]
          const newChild = getCopyCmp(child)
          newChild.groupKey = newCmp.key
          newCmp.groupCmpKeys!.push(newChild.key)
          newCmps.push(newChild)
          i++
        })
      }
      newCmps.push(newCmp)
      newAssembly.add(i++)
    })
    draft.assembly = newAssembly
    draft.canvas.content.cmps = draft.canvas.content.cmps.concat(newCmps)
    draft.hasSavedCanvas = false
    recordCanvasChangeHistory(draft)
  })
}
//组合
export const groupCmps = () => {
  useEditStore.setState(draft => {
    //组合所有子组件，生成一个新的父组件
    let { cmps } = draft.canvas.content
    const map = getCmpsMap(cmps)
    const { top, left, width, height } = computeBoxStyle(cmps, draft.assembly)
    const groupCmp: ICmpWithKey = {
      key: getOnlyKey(),
      type: isGroupComponent,
      style: {
        ...defaultComponentStyle_0,
        top,
        left,
        width,
        height
      },
      groupCmpKeys: []
    }

    draft.assembly.forEach(index => {
      const cmp = cmps[index]
      //如果组件本身就是组合组件
      if (cmp.type & isGroupComponent) {
        cmp.groupCmpKeys?.forEach(key => {
          const childCmpIndex = map.get(key)
          const child = cmps[childCmpIndex]
          groupCmp.groupCmpKeys?.push(key)
          child.groupKey = groupCmp.key
          map.delete(key)
        })
      } else {
        groupCmp.groupCmpKeys?.push(cmp.key)
        cmp.groupKey = groupCmp.key
      }
    })

    //删除老的组合组件
    cmps = cmps.filter(
      (cmp, index) =>
        !(cmp.type & isGroupComponent && draft.assembly.has(index))
    )
    cmps.push(groupCmp)
    draft.canvas.content.cmps = cmps
    draft.hasSavedCanvas = false
    draft.assembly = new Set([cmps.length - 1])
    recordCanvasChangeHistory(draft)
  })
}

//取消组合
export const cancelGroupCmps = () => {
  useEditStore.setState(draft => {
    // 1.拆分子组件 2.拆除父组件 3.选中子组件
    let { cmps } = draft.canvas.content
    const selectedIndex = selectedCmpIndexSelector(draft)
    const map = getCmpsMap(cmps)
    const selectedGroup = cmps[selectedIndex]
    const newAssembly: Set<number> = new Set()
    selectedGroup.groupCmpKeys?.forEach(key => {
      const cmpIndex = map.get(key)
      const cmp = cmps[cmpIndex]
      cmp.groupKey = undefined
      newAssembly.add(cmpIndex)
    })
    cmps = cmps.slice(0, selectedIndex).concat(cmps.slice(selectedIndex + 1))
    draft.canvas.content.cmps = cmps
    draft.hasSavedCanvas = false
    draft.assembly = newAssembly
    recordCanvasChangeHistory(draft)
  })
}
//上移一层
export const addZIndex = () => {
  useEditStore.setState(draft => {
    const cmps = draft.canvas.content.cmps
    const selectedIndex = selectedCmpIndexSelector(draft)
    if (selectedIndex === cmps.length - 1) {
      return
    } else {
      ;[cmps[selectedIndex], cmps[selectedIndex + 1]] = [
        cmps[selectedIndex + 1],
        cmps[selectedIndex]
      ]
      draft.assembly = new Set([selectedIndex + 1])
      draft.hasSavedCanvas = false
      recordCanvasChangeHistory(draft)
    }
  })
}
//下移一层
export const subZIndex = () => {
  useEditStore.setState(draft => {
    const cmps = draft.canvas.content.cmps
    const selectedIndex = selectedCmpIndexSelector(draft)
    if (selectedIndex === 0) {
      return
    } else {
      ;[cmps[selectedIndex - 1], cmps[selectedIndex]] = [
        cmps[selectedIndex],
        cmps[selectedIndex - 1]
      ]
      draft.assembly = new Set([selectedIndex - 1])
      draft.hasSavedCanvas = false
      recordCanvasChangeHistory(draft)
    }
  })
}
//置顶
//[...m,...n,1]普通组件、子组件、父组件
//对所有组件进行重新排序
export const topZIndex = () => {
  useEditStore.setState(draft => {
    const cmps = draft.canvas.content.cmps
    const selectedIndex = selectedCmpIndexSelector(draft)
    const selectedCmp = cmps[selectedIndex]
    if (selectedCmp.type & isGroupComponent) {
      const len = cmps.length
      const groupCmpKeys = selectedCmp.groupCmpKeys ?? []

      let m = 0,
        n = len - (selectedCmp.groupCmpKeys?.length ?? 0) - 1
      for (let i = 0; i < len; i++) {
        const originCmps = [...cmps]
        const cmp = originCmps[i]
        //父组件
        if (cmp.key === selectedCmp.key) {
          cmps[len - 1] = cmp
        } else if (groupCmpKeys.includes(cmp.key)) {
          //子组件
          cmps[n++] = cmp
        } else {
          //普通组件
          cmps[m++]
        }
      }
    } else {
      if (selectedIndex === cmps.length - 1) {
        return
      } else {
        draft.canvas.content.cmps = cmps
          .slice(0, selectedIndex)
          .concat(cmps.slice(selectedIndex + 1))
          .concat(cmps[selectedIndex])
        draft.assembly = new Set([cmps.length - 1])
        draft.hasSavedCanvas = false
        recordCanvasChangeHistory(draft)
      }
    }
  })
}
//置底
//[1,...n,...m]
export const bottomZIndex = () => {
  useEditStore.setState(draft => {
    const cmps = draft.canvas.content.cmps
    const selectedIndex = selectedCmpIndexSelector(draft)
    const selectedCmp = cmps[selectedIndex]
    if (selectedCmp.type & isGroupComponent) {
      const len = cmps.length
      const groupCmpKeys = selectedCmp.groupCmpKeys ?? []

      let n = 1,
        m = 1 + groupCmpKeys.length
      for (let i = 0; i < len; i++) {
        const originCmps = [...cmps]
        const cmp = originCmps[i]
        //父组件
        if (cmp.key === selectedCmp.key) {
          cmps[0] = cmp
        } else if (groupCmpKeys.includes(cmp.key)) {
          //子组件
          cmps[n++] = cmp
        } else {
          //普通组件
          cmps[m++]
        }
      }
    } else {
      if (selectedIndex === 0) {
        return
      } else {
        draft.canvas.content.cmps = [cmps[selectedIndex]]
          .concat(cmps.slice(0, selectedIndex))
          .concat(cmps.slice(selectedIndex + 1))

        draft.assembly = new Set([0])
        draft.hasSavedCanvas = false
        recordCanvasChangeHistory(draft)
      }
    }
  })
}

// isNew 标记是否为新增页面，如果是新增，则在保存后需要跳转一次路由
export const saveCanvas = async (
  successCallback: (id: number, isNew: boolean, res: any) => void
) => {
  const canvas = useEditStore.getState().canvas
  let isNew = canvas.id == null
  useEditStore.setState(draft => {
    draft.hasSavedCanvas = true
  })
  const res: any = await Axios.post(saveCanvasEnd, {
    id: canvas.id,
    type: canvas.type,
    title: canvas.title,
    content: JSON.stringify(canvas.content)
  })

  successCallback(res?.id, isNew, res)

  useEditStore.setState(draft => {
    if (isNew) {
      draft.canvas.id = res.id
    }
  })
}

export const fetchCanvas = async (id: number) => {
  const res: any = await Axios.get(getCanvasByIdEnd + id)
  if (res) {
    useEditStore.setState(draft => {
      draft.canvas.content = JSON.parse(res.content)
      draft.canvas.id = res.id
      draft.canvas.type = res.type
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

//修改画布的样式
export const updateCanvasStyle = (newStyle: { [key: string]: any }) => {
  useEditStore.setState(draft => {
    const style = {
      ...draft.canvas.content.style,
      ...newStyle
    }
    draft.canvas.content.style = style
    draft.hasSavedCanvas = false
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
//修改画布的标题
export const updateCanvasTitle = (title: string) => {
  useEditStore.setState(draft => {
    draft.canvas.title = title
    draft.hasSavedCanvas = false
    recordCanvasChangeHistory(draft)
  })
}
//选择模版，生成页面
export const addCanvasByTemplate = (res: any) => {
  useEditStore.setState(draft => {
    draft.canvas.content = JSON.parse(res.content)
    draft.canvas.id = null
    draft.canvas.title = res.title + ' 副本'
    draft.canvas.type = 'content'
    draft.assembly.clear()
    draft.hasSavedCanvas = false
    recordCanvasChangeHistory(draft)
  })
}

export default useEditStore

function getDefaultCanvasContent (): IContent {
  return {
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

export function getCmpsMap (cmps: Array<ICmpWithKey>) {
  const map = new Map()
  cmps.forEach((cmp, index) => {
    map.set(cmp.key, index)
  })
  return map
}
