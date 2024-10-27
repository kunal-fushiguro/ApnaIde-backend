import { Request, Response } from "express"
import { ApiResponse } from "../utils/apiResponse"
import { Users, UserType } from "../models/user"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import { logger } from "../logger"
import { JWT_SECRET_TOKEN } from "../utils/env"

async function checkAuth(req: Request, res: Response): Promise<void> {
    try {
        const isUserExisted = await Users.findById(req.userId)
        if (!isUserExisted) {
            const responseObj = new ApiResponse(400, false, `Email not register.`)
            res.status(400).json(responseObj)
            return
        }

        const user: UserType = {
            name: isUserExisted.name,
            email: isUserExisted.email,
            _id: String(isUserExisted._id),
            containersList: [...isUserExisted.containersList]
        }
        const responseobj = new ApiResponse(200, true, "User data.", user)

        res.status(200).json(responseobj)
        return
    } catch (error) {
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
async function register(req: Request, res: Response): Promise<void> {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            const responseObj = new ApiResponse(400, false, `All fields are required.`)
            res.status(400).json(responseObj)
            return
        }

        const isUserExisted = await Users.findOne({ email: email })
        if (isUserExisted) {
            const responseObj = new ApiResponse(400, false, `Email alrady register.`)
            res.status(400).json(responseObj)
            return
        }

        const hashedPassword = await bcryptjs.hash(password, 12)
        await Users.create({
            name: name,
            email: email,
            password: hashedPassword,
            containersList: []
        })

        const responseobj = new ApiResponse(201, true, "User email register.")
        res.status(201).json(responseobj)
    } catch (error) {
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
async function login(req: Request, res: Response): Promise<void> {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            const responseObj = new ApiResponse(400, false, `All fields are required.`)
            res.status(400).json(responseObj)
            return
        }

        const isUserExisted = await Users.findOne({ email: email }).select("password")
        if (!isUserExisted) {
            const responseObj = new ApiResponse(400, false, `Email not register.`)
            res.status(400).json(responseObj)
            return
        }

        const isPasswordCorrect = await bcryptjs.compare(password, isUserExisted.password)
        if (!isPasswordCorrect) {
            const responseObj = new ApiResponse(401, false, `Invalid credentails.`)
            res.status(401).json(responseObj)
            return
        }

        const cookie = jwt.sign({ id: isUserExisted._id }, String(JWT_SECRET_TOKEN))
        const user: UserType = {
            name: isUserExisted.name,
            email: isUserExisted.email,
            _id: String(isUserExisted._id),
            containersList: isUserExisted.containersList
        }

        const responseobj = new ApiResponse(200, true, "User login.", user)
        res.cookie("user", cookie, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })

        res.status(200).json(responseobj)
        return
    } catch (error) {
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
async function update(req: Request, res: Response): Promise<void> {
    try {
        const { name, password } = req.body
        if (!name || !password) {
            const responseObj = new ApiResponse(400, false, `All fields are required.`)
            res.status(400).json(responseObj)
            return
        }

        const hashedPassword = await bcryptjs.hash(password, 12)
        const isUserExisted = await Users.findByIdAndUpdate(req.userId, { name: name, password: hashedPassword })
        res.cookie("user", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 0,
            expires: new Date()
        })
        if (!isUserExisted) {
            const responseObj = new ApiResponse(400, false, `User not existed.`)
            res.status(400).json(responseObj)
            return
        }

        const responseObj = new ApiResponse(200, false, `User updated plz login.`)
        res.status(200).json(responseObj)
        return
    } catch (error) {
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
async function remove(req: Request, res: Response): Promise<void> {
    try {
        const isUserExisted = await Users.findByIdAndDelete(req.userId)
        res.cookie("user", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 0,
            expires: new Date()
        })
        if (!isUserExisted) {
            const responseObj = new ApiResponse(400, false, `User not existed.`)
            res.status(400).json(responseObj)
            return
        }

        const responseObj = new ApiResponse(200, true, `User deleted.`)
        res.status(200).json(responseObj)
        return
    } catch (error) {
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

function logout(_: Request, res: Response): void {
    try {
        res.cookie("user", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 0,
            expires: new Date()
        })
        const responseObj = new ApiResponse(200, true, `User logout`)
        res.status(200).json(responseObj)
        return
    } catch (error) {
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

export { register, login, update, remove, checkAuth, logout }

