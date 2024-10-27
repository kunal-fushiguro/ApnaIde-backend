import { logger } from "./logger"
import express, { Express, Request, Response } from "express"
import { router } from "./routes/routes"
import { ApiResponse } from "./helper/apiResponse"

const app: Express = express()
const PORT: number = 7070

app.use("/api/v1", router)

app.use("/*", function (_: Request, response: Response) {
    const responseObj = new ApiResponse(404, false, "Api endpoint not found.")
    response.status(404).json(responseObj)
})

app.listen(PORT, function () {
    logger.info(`Server Started on PORT : ${PORT}`)
})

