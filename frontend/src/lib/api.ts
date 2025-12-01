export const apiHost = 'api/v1'

export const user = `user`

const api = {
    // photo (legacy)
    updatePhotos: `/${apiHost}/photo/upload`,
    listPhotos: `/${apiHost}/photo/list`,
    // daily photograph
    createDailyPhotograph: `/${apiHost}/daily_photograph/create`,
    getUserDailyPhotographs: `/${apiHost}/daily_photograph/user`,
    getDailyPhotographsByDateRange: `/${apiHost}/daily_photograph/date_range`,
    getDailyPhotograph: `/${apiHost}/daily_photograph/detail`,
    updateDailyPhotograph: `/${apiHost}/daily_photograph/update`,
    deleteDailyPhotograph: `/${apiHost}/daily_photograph/delete`,
    likeDailyPhotograph: `/${apiHost}/daily_photograph/like`,
    // article comment
    submitArticleComment: `/${apiHost}/article_comment/add`,
    listArticleComment: `/${apiHost}/article_comment/list`,
    // article
    articles: `/${apiHost}/articles`,
    // user
    userLogin: `/${apiHost}/${user}/login`,
    userRegister: `/${apiHost}/${user}/register`,
    userEmailVerificationCode: `/${apiHost}/${user}/emailVerificationCode`,
    userVerifyEmailVerificationCode: `/${apiHost}/${user}/verifyEmailVerificationCode`,
    userCheckUserName: `/${apiHost}/${user}/checkUserName`,
    userCheckEmail: `/${apiHost}/${user}/checkUserEmail`,
    validateAccessToken: `/${apiHost}/${user}/validateAccessToken`,
    refreshToken: `/${apiHost}/${user}/refreshToken`,
    // user profile
    getUserProfile: `/${apiHost}/${user}/profile`,
    updateUserProfile: `/${apiHost}/${user}/profile`,
    uploadAvatar: `/${apiHost}/${user}/avatar`,
    changePassword: `/${apiHost}/${user}/password`,
    getOperationLogs: `/${apiHost}/${user}/operation-logs`,
    // others
}

export default api;
