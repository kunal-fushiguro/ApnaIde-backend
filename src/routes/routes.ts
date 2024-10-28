import { Router } from "express"
import { test } from "../controllers/test"
import { checkAuth, login, logout, register, remove, update } from "../controllers/users"
import { authMiddleware } from "../middleware/auth"
import { deleteContainer, listContainers, runContainers, stopContainer } from "../controllers/dockerode"

const router = Router()

router.get("/test", test)

// users routes
router.post("/users", register)
router.post("/users/login", login)
router.get("/users/logout", logout)
router.get("/users", authMiddleware, checkAuth)
router.put("/users", authMiddleware, update)
router.delete("/users", authMiddleware, remove)

// containers routes
router.post("/containers", authMiddleware, runContainers)
router.patch("/containers", authMiddleware, stopContainer)
router.delete("/containers", authMiddleware, deleteContainer)
router.get("/containers", authMiddleware, listContainers)

export { router }

