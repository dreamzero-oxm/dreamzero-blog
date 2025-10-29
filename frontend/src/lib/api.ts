export const apiHost = 'api/v1'

export const user = `user`

const api = {
    // photo
    updatePhotos: `/${apiHost}/photo/upload`,
    listPhotos: `/${apiHost}/photo/list`, 
    // article comment
    submitArticleComment: `/${apiHost}/article_comment/add`,
    listArticleComment: `/${apiHost}/article_comment/list`,
    // article
    articles: `/${apiHost}/article`,
    // user
    userLogin: `/${apiHost}/${user}/login`,
    userRegister: `/${apiHost}/${user}/register`,
    userEmailVerificationCode: `/${apiHost}/${user}/emailVerificationCode`,
    userVerifyEmailVerificationCode: `/${apiHost}/${user}/verifyEmailVerificationCode`,
    userCheckUserName: `/${apiHost}/${user}/checkUserName`,
    userCheckEmail: `/${apiHost}/${user}/checkUserEmail`,
    validateAccessToken: `/${apiHost}/${user}/validateAccessToken`,
    refreshToken: `/${apiHost}/${user}/refreshToken`,
    // others   
}

export default api;
