import { logger } from "./logger"
import express, { Express, Request, Response } from "express"
import { router } from "./routes/routes"
import { ApiResponse } from "./utils/apiResponse"
import { dbConnect } from "./db/db"

const app: Express = express()
const PORT: number = 7070

app.use("/api/v1", router)

app.use("/*", function (_: Request, response: Response) {
    const responseObj = new ApiResponse(404, false, "Api endpoint not found.")
    response.status(404).json(responseObj)
})

async function startServer() {
    try {
        await dbConnect()
        app.listen(PORT, function () {
            logger.info(`Server Started on PORT : ${PORT}`)
        })
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error("Error:", error.message)
        } else {
            logger.error("Unknown error:", error)
        }
    }
}

startServer().then(() => {})

