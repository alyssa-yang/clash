import React from 'react'

export type Style = React.CSSProperties

export interface ICanvas {
  title: string
  style: Style
  cmps: Array<ICmpWithKey>
}

export interface ICmp {
  //组件类型
  type: number
  style: Style
  value: string
  onClick?: string
}

export interface ICmpWithKey extends ICmp {
  key: number
}

export type EditStoreState = {
  canvas: ICanvas
  assembly: Set<number>
  //记录历史
  canvasChangeHistory: Array<{ canvas: ICanvas; assembly: Set<number> }>
  canvasChangeHistoryIndex: number
}

export type EditStoreAction = {
  //   addCmp: AddCmpFC
}

export type AddCmpFC = (_cmp: ICmp) => void

export interface IEditStore extends EditStoreState, EditStoreAction {}
