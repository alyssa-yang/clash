import { ICmpWithKey } from 'src/store/editStoreTypes'

export function isCmpInView (cmp: ICmpWithKey) {
  const element = document.getElementById(`cmp${cmp.key}`) as HTMLElement

  const viewWidth = window.innerWidth || document.documentElement.clientWidth
  const viewHeight = window.innerHeight || document.documentElement.clientHeight
  const { top, right, left, bottom } = element.getBoundingClientRect()

  return top >= 0 && left >= 0 && right <= viewWidth && bottom <= viewHeight
}
