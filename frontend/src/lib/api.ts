// import {useSSL, apiAddress, apiPort} from '@/lib/config'

// export const baseUrl = `${useSSL ? 'https' : 'http'}://${apiAddress}:${apiPort}`
export const baseUrl = ``
export const apiHost = 'api/v1'

export const user = `user`

const api = {
    // photo
    updatePhotos: `${baseUrl}/${apiHost}/photo/upload`,
    listPhotos: `${baseUrl}/${apiHost}/photo/list`, 
    // article comment
    submitArticleComment: `${baseUrl}/${apiHost}/article_comment/add`,
    listArticleComment: `${baseUrl}/${apiHost}/article_comment/list`,
    // user
    userLogin: `${baseUrl}/${apiHost}/${user}/login`,
    userRegister: `${baseUrl}/${apiHost}/${user}/register`,
    userEmailVerificationCode: `${baseUrl}/${apiHost}/${user}/emailVerificationCode`,
    userVerifyEmailVerificationCode: `${baseUrl}/${apiHost}/${user}/verifyEmailVerificationCode`,
    userCheckUserName: `${baseUrl}/${apiHost}/${user}/checkUserName`,
    userCheckEmail: `${baseUrl}/${apiHost}/${user}/checkUserEmail`,
    validateAccessToken: `${baseUrl}/${apiHost}/${user}/validateAccessToken`,
    refreshToken: `${baseUrl}/${apiHost}/${user}/refreshToken`,
    // others   
}

export default api;
