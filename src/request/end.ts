import axios from './axios'
// export const serverHost = 'http://localhost:4000'
// export const builderHost = 'http://localhost:5002'

export const serverHost = 'http://clash-server.echoyore.tech'
export const builderHost = 'http://clash-builder.echoyore.tech'

export const end = ''

// 注册 post
export const registerEnd = end + '/api/register'

// 用户信息
export const getUserInfo = end + '/api/info'
export const loginEnd = end + '/api/login'
export const logoutEnd = end + '/api/logout'

// 画布信息
// 根据id获取画布信息
export const getCanvasByIdEnd = end + '/api/web/content/get?id='
// 保存画布
export const saveCanvasEnd = end + '/api/web/content/save'
// 删除画布
export const deleteCanvasByIdEnd = end + '/api/web/content/delete'

// 画布列表
export const getCanvasListEnd = end + '/api/web/content/list?pageSize=1000'
export const getTemplateListEnd = end + '/api/web/template/list?pageSize=1000'

// 发布、下架
export const publishEnd = end + '/api/web/content/publish'
export const unpublishEnd = end + '/api/web/content/unpublish '

export const myAxios = axios

export function downloadFile (fileUrl: string, fileName: string) {
  fetch(fileUrl)
    .then(response => response.blob())
    .then(blob => {
      const a = document.createElement('a')
      const parseUrl = URL.createObjectURL(blob)
      a.href = parseUrl
      a.download = fileName

      // 在部分浏览器中，创建Blob链接后，需要延迟点击事件才能正常下载
      setTimeout(() => {
        a.click()
        URL.revokeObjectURL(parseUrl)
      }, 0)
    })
}
