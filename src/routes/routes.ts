import { Router } from "express"
import { test } from "../controllers/test"

const router = Router()

router.get("/test", test)

export { router }

