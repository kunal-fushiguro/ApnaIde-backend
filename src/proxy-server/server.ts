import cookieParser from "cookie-parser"
import express, { Request, Response } from "express"
import httpProxy from "http-proxy"
import http from "http"
import { ApiResponse } from "../utils/apiResponse"
import { logger } from "../logger"

const proxyServer = express()
const httpServer = http.createServer(proxyServer)

const proxy = httpProxy.createProxyServer()

proxyServer.use(cookieParser())
proxyServer.use(express.json())

proxyServer.use(function (req: Request, res: Response) {
    try {
        const { target } = req.body
        if (!target) {
            const response = new ApiResponse(400, false, `Target IP is required.`)
            res.status(400).json(response)
        }

        return proxy.web(req, res, { target: target, changeOrigin: true, ws: true })
    } catch (error: any) {
        const response = new ApiResponse(500, false, `Error : ${error.message}`)
        res.status(500).json(response)
    }
})

httpServer.on("upgrade", (req, socket, head) => {
    try {
        // Extract the 'target' from request headers (or query params)
        const target = req.headers["x-target"] || new URL(req.url || "", `http://${req.headers.host}`).searchParams.get("target")

        if (!target) {
            socket.write("HTTP/1.1 400 Bad Request\r\n\r\nTarget IP is required.\r\n")
            socket.destroy()
            return
        }
        console.log(target)

        // Proxy the WebSocket request to the target
        proxy.ws(req, socket, head, { target: String(target[0]) || String(target), changeOrigin: true }, (error) => {
            logger.error(`WebSocket proxy error: ${error.message}`)
            socket.end()
        })
    } catch (error: any) {
        logger.error(`WebSocket upgrade error: ${error.message}`)
        socket.destroy()
    }
})

export { httpServer }

