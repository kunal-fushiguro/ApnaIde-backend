import dotenv from "dotenv"

dotenv.config()

export const { MONGODB_URL, JWT_SECRET_TOKEN, PORT } = process.env
