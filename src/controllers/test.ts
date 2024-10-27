import { Request, Response } from "express"
import { ApiResponse } from "../helper/apiResponse"

function test(_: Request, response: Response) {
    const responseObj = new ApiResponse(200, true, "test api endpoint")
    response.status(200).json(responseObj)
}
export { test }

