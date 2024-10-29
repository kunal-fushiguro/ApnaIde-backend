import Docker from "dockerode"
import { logger } from "../logger"
import { Request, Response } from "express"
import { ApiResponse } from "../utils/apiResponse"
import { Containers } from "../models/containers"
import { Users } from "../models/user"

// const images = {
//     reactjs: "2111b97ddb94"
// }

const dockerode = new Docker()

async function runContainers(req: Request, res: Response) {
    try {
        const { imageId, containerName } = req.body
        if (!imageId || !containerName) {
            const response = new ApiResponse(400, false, "imageId, containerName is required")
            res.status(400).json(response)
            return
        }

        const isUserExisted = await Users.findById(req.userId)
        if (!isUserExisted) {
            const response = new ApiResponse(400, false, "User not found")
            res.status(400).json(response)
            return
        }

        const container = await dockerode.createContainer({
            Image: imageId,
            name: `${containerName}${Math.floor(Math.random() * 10000)}`,
            Tty: false
        })
        await container.start()
        const data = await container.inspect()

        const exposedPort = Object.keys(data.Config.ExposedPorts)
        let containerPort
        if (exposedPort && exposedPort.length > 0) {
            const [port, type] = exposedPort[0].split("/")
            if (type == "tcp") {
                containerPort = port
            }
        }
        const newContainer = await Containers.create({
            containerId: data.Id,
            ip: data.NetworkSettings.IPAddress,
            port: containerPort,
            containerName: data.Name,
            userId: isUserExisted._id,
            status: true
        })

        await Users.findByIdAndUpdate(isUserExisted._id, { $push: { containersList: newContainer._id } })

        const response = new ApiResponse(201, true, `${containerName} container started`, { containerId: (await container.inspect()).Id })
        res.status(201).json(response)
    } catch (error: any) {
        logger.error("Error : ", error.message)
        const response = new ApiResponse(500, false, error.message)
        res.status(500).json(response)
    }
}

async function stopContainer(req: Request, res: Response) {
    try {
        const { containerId } = req.body
        if (!containerId) {
            const response = new ApiResponse(400, false, "imageId is required")
            res.status(400).json(response)
            return
        }

        const container = await dockerode.getContainer(containerId)
        await container.stop()
        await Containers.findOneAndUpdate({ containerId: containerId }, { status: false })

        const response = new ApiResponse(200, true, `container stoped`)
        res.status(200).json(response)
    } catch (error: any) {
        logger.error("Error : ", error.message)
        const response = new ApiResponse(500, false, error.message)
        res.status(500).json(response)
    }
}

async function deleteContainer(req: Request, res: Response) {
    try {
        const { containerId, id } = req.body
        if (!containerId || !id) {
            const response = new ApiResponse(400, false, "containerId & id is required")
            res.status(400).json(response)
            return
        }

        const isUserExisted = await Users.findById(req.userId)
        if (!isUserExisted) {
            const response = new ApiResponse(400, false, "User not found")
            res.status(400).json(response)
            return
        }

        const container = await dockerode.getContainer(containerId)
        await container.remove()
        await Containers.findOneAndDelete({ containerId: containerId })
        await Users.findByIdAndUpdate(isUserExisted._id, { $pull: { containersList: id } })

        const response = new ApiResponse(200, true, `container deleted`)
        res.status(200).json(response)
    } catch (error: any) {
        logger.error("Error : ", error.message)
        const response = new ApiResponse(500, false, error.message)
        res.status(500).json(response)
    }
}

async function listContainers(req: Request, res: Response) {
    try {
        const isUserExisted = await Users.findById(req.userId).populate("containersList")
        if (!isUserExisted) {
            const response = new ApiResponse(400, false, "User not found")
            res.status(400).json(response)
            return
        }

        const response = new ApiResponse(200, true, "Data fetched", { ...isUserExisted.containersList })
        res.status(200).json(response)
    } catch (error: any) {
        logger.error("Error : ", error.message)
        const response = new ApiResponse(500, false, error.message)
        res.status(500).json(response)
    }
}

async function startSingleContainer(req: Request, res: Response) {
    try {
        const { containerId } = req.body
        if (!containerId) {
            const response = new ApiResponse(400, false, "imageId is required")
            res.status(400).json(response)
            return
        }

        const container = await dockerode.getContainer(containerId)
        await container.start()
        await Containers.findOneAndUpdate({ containerId: containerId }, { status: true })

        const response = new ApiResponse(200, true, `${(await container.inspect()).Name} container started`)
        res.status(200).json(response)
    } catch (error: any) {
        logger.error("Error : ", error.message)
        const response = new ApiResponse(500, false, error.message)
        res.status(500).json(response)
    }
}

export { runContainers, stopContainer, deleteContainer, listContainers, startSingleContainer }

