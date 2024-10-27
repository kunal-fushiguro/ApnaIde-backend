import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { logger } from "../logger"
import { ApiResponse } from "../utils/apiResponse"
import { JWT_SECRET_TOKEN } from "../utils/env"

declare module "express-serve-static-core" {
    interface Request {
        userId?: string | JwtPayload
    }
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies.user

        if (!token) {
            res.cookie("user", "", {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 0,
                expires: new Date()
            })
            const responseObj = new ApiResponse(400, false, `Token not found`)
            res.status(400).json(responseObj)
            return
        }

        const isValid: any = await jwt.verify(token, String(JWT_SECRET_TOKEN))

        if (!isValid) {
            res.cookie("user", "", {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 0,
                expires: new Date()
            })
            const responseObj = new ApiResponse(400, false, `Token expired.`)
            res.status(400).json(responseObj)
            return
        }

        req.userId = isValid.id
        next()
    } catch (error: unknown) {
        res.cookie("user", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 0,
            expires: new Date()
        })
        if (error instanceof Error) {
            logger.error("Error:", error.message)
            const responseObj = new ApiResponse(500, false, `Error: ${error.message}`, { error })
            res.status(500).json(responseObj)
        } else {
            logger.error("Unknown error:", error)
            const responseObj = new ApiResponse(500, false, "An unknown error occurred", { error })
            res.status(500).json(responseObj)
        }
    }
}

export { authMiddleware }

