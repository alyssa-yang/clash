export type Style = any

export interface ICanvas {
  id: null | number
  title: string
  //页面或者是模版页面
  type: 'content' | 'template'
  content: IContent
}

export interface IContent {
  style: Style
  cmps: Array<ICmpWithKey>
  formKeys?: Array<string>
}
export interface ISubmit {
  url: string
  afterSuccess: 'pop' | 'url'
  popMsg?: string
  link?: string
}
export interface ICmp {
  //组件类型
  type: number
  style: Style
  value?: string
  onClick?: string | ISubmit

  //父组件key
  groupKey?: string
  // group组件的子组件 key 数组
  groupCmpKeys?: Array<string>

  //提交后端的字段
  formItemName?: string
  // 标记form的key
  formKey?: string
  desc?: string
  // input
  inputType?: string
  placeholder?: string

  //属性
  alignPage?: string
}

export interface ICmpWithKey extends ICmp {
  key: string
}

export type EditStoreState = {
  hasSavedCanvas: boolean
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
