import {useSSL, apiAddress, apiPort} from '@/lib/config'

export const baseUrl = `${useSSL ? 'https' : 'http'}://${apiAddress}:${apiPort}`
export const apiHost = 'api/v1'

export const photoHost = `photo`
export const articalComment = `artical_comment`

const api = {
    // photo
    updatePhotos: `${baseUrl}/${apiHost}/${photoHost}/upload`,
    listPhotos: `${baseUrl}/${apiHost}/${photoHost}/list`, 
    // article comment
    submitArticleComment: `${baseUrl}/${apiHost}/${articalComment}/add`,
    // others   
}

export default api;
