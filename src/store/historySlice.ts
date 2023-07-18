import useEditStore from './editStore'
import { EditStoreState } from './editStoreTypes'

const maxCanvasChangeHistory = 100

export const recordCanvasChangeHistory = (draft: EditStoreState) => {
  const canvasChangeHistory = draft.canvasChangeHistory
  draft.canvasChangeHistory = canvasChangeHistory.slice(
    0,
    draft.canvasChangeHistoryIndex + 1
  )

  draft.canvasChangeHistory.push({
    canvas: draft.canvas,
    assembly: draft.assembly
  })
  draft.canvasChangeHistoryIndex++
  if (draft.canvasChangeHistoryIndex > maxCanvasChangeHistory) {
    draft.canvasChangeHistory.shift()
    draft.canvasChangeHistoryIndex--
  }
}

export const goPrevCanvasHistory = () => {
  useEditStore.setState(draft => {
    let newIndex = draft.canvasChangeHistoryIndex - 1
    if (newIndex < 0) {
      newIndex = 0
    }
    if (draft.canvasChangeHistoryIndex === newIndex) {
      return
    }
    const item = draft.canvasChangeHistory[newIndex]
    draft.canvas = item.canvas
    draft.assembly = item.assembly
    draft.canvasChangeHistoryIndex = newIndex
  })
}

export const goNextCanvasHistory = () => {
  useEditStore.setState(draft => {
    let newIndex = draft.canvasChangeHistoryIndex + 1
    if (newIndex >= draft.canvasChangeHistory.length) {
      newIndex = draft.canvasChangeHistory.length
    }
    if (draft.canvasChangeHistoryIndex === newIndex) {
      return
    }
    const item = draft.canvasChangeHistory[newIndex]
    draft.canvas = item.canvas
    draft.assembly = item.assembly
    draft.canvasChangeHistoryIndex = newIndex
  })
}
