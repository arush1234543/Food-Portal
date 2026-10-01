import { Router } from "express";
import * as orderController from "../controller/order.controller.js";

const orderRouter = Router();

orderRouter.post("/place-order", orderController.PlaceOrder);
orderRouter.post("/confirm-order", orderController.ConfirmOrder);
orderRouter.post("/complete-order", orderController.OrderCompleted);
orderRouter.post("/add-item", orderController.addItem);
orderRouter.post("/cancel-order", orderController.cancelOrder);
orderRouter.get("/pending", orderController.getPendingOrder);
orderRouter.get("/all", orderController.getAllOrders);
orderRouter.patch("/delivery-instruction", orderController.updateDeliveryInstruction);
orderRouter.patch("/delivery-address", orderController.updateDeliveryAddress);

export default orderRouter;