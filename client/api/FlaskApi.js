import {axiosClient2} from "./axios"

const FlaskApi = {
    createinterview: (data) => axiosClient2.post('/create',data)
}

export default FlaskApi