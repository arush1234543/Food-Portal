import { Router } from 'express'
import * as foodController from '../controller/food.controller.js'

const foodRouter = Router()

foodRouter.get("/get-food-items", foodController.getFoodItems)
foodRouter.get("/get-food-by-id/:id", foodController.GetFoodById)
foodRouter.post("/search-food", foodController.searchFood)

export default foodRouter