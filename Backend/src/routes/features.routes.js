import { Router } from "express"
import * as featuresController from '../controller/features.controller.js'

const featureRouter = Router()

featureRouter.post("/change-theme", featuresController.changeTheme)

export default featureRouter;