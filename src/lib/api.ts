import {useSSL, apiAddress, apiPort} from '@/lib/config'

export const baseUrl = `${useSSL ? 'https' : 'http'}://${apiAddress}:${apiPort}`
export const apiHost = 'api/v1'

export const photoHost = `photo`

export default {
    // photo
    updatePhotos: `${baseUrl}/${apiHost}/${photoHost}/upload`,
    listPhotos: `${baseUrl}/${apiHost}/${photoHost}/list`, 
    // others   
}
