import { logger } from "./logger"
import express, { Express, Request, Response } from "express"
import { router } from "./routes/routes"
import { ApiResponse } from "./utils/apiResponse"
import { dbConnect } from "./db/db"
import cookieparser from "cookie-parser"

const app: Express = express()
const PORT: number = 7070

app.use(express.json())
app.use(cookieparser())
app.use("/api/v1", router)

app.use("/*", function (_: Request, response: Response) {
    const responseObj = new ApiResponse(404, false, "Api endpoint not found.")
    response.status(404).json(responseObj)
})

app.listen(PORT, async function () {
    try {
        await dbConnect()
        logger.info(`Server Started on PORT : ${PORT}`)
    } catch (error) {
        if (error instanceof Error) {
            logger.error("Error:", error.message)
        } else {
            logger.error("Unknown error:", error)
        }
    }
})

