import mongoose from "mongoose"
import { logger } from "../logger"
import { MONGODB_URL } from "../utils/env"

async function dbConnect() {
    try {
        await mongoose.connect(String(MONGODB_URL), { dbName: "apnaide" })
        logger.info("DB connected ")
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error("Error:", error.message)
        } else {
            logger.error("Unknown error:", error)
        }
    }
}

export { dbConnect }

