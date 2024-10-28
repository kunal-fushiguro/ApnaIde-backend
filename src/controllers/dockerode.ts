import Docker from "dockerode"
import { logger } from "../logger"
import { Request, Response } from "express"
import { ApiResponse } from "../utils/apiResponse"

// const images = {
//     reactjs: "2111b97ddb94"
// }

const dockerode = new Docker()

async function runContainers(req: Request, res: Response) {
    try {
        const { imageId, containerName } = req.body
        const container = await dockerode.createContainer({
            Image: imageId,
            name: `${containerName}${Math.floor(Math.random() * 10000)}`,
            Tty: false,
            HostConfig: { AutoRemove: true }
        })
        await container.start()

        const response = new ApiResponse(201, true, `${containerName} container started`, { containerId: (await container.inspect()).Id })
        res.status(201).json(response)
    } catch (error: any) {
        logger.error("Error : ", error.message)
        const response = new ApiResponse(500, false, error.message)
        res.status(500).json(response)
    }
}

export { runContainers }

