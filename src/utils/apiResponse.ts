class ApiResponse {
    statusCode: number
    success: boolean
    msg: string
    data: object | undefined
    constructor(statusCode: number, success: boolean, msg: string, data?: object) {
        this.statusCode = statusCode
        this.success = success
        this.msg = msg
        if (data) {
            this.data = data
        }
    }
}

interface CustomError extends Error {
    message: string
}

export { ApiResponse, CustomError }

