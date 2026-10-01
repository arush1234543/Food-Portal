import bcrypt from "bcrypt";
import User from "../models/User.model.js";
import Order from "../models/Order.model.js";
import Food from "../models/Food.model.js";
import Session from "../models/Session.model.js";
import { isAppropriate } from "../services/isAppropriate.service.js";
import { getCoordinates } from "../services/cordinates.service.js";

export async function PlaceOrder(req, res) {
    try {
        const { email, order } = req.body;

        if (!email || !order) {
            return res.status(400).json({
                success: false,
                message: "Email and order are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const { orderItems, address, deliveryInstructions, paymentMethod } = order;

        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order must contain at least one item"
            });
        }

        if (!address?.street || !address?.city || !address?.postalCode) {
            return res.status(400).json({
                success: false,
                message: "Complete address is required"
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Payment method is required"
            });
        }

        for (const item of orderItems) {
            if (!item.id) {
                return res.status(400).json({
                    success: false,
                    message: "Food item ID is required"
                });
            }

            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be a positive integer"
                });
            }
        }

        const foodItems = [];

        for (const item of orderItems) {
            const food = await Food.findById(item.id);

            if (!food) {
                return res.status(404).json({
                    success: false,
                    message: `Food item ${item.id} not found`
                });
            }

            const price = Number(food.price);

            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid price for food item ${item.id}`
                });
            }

            foodItems.push({
                food: food._id,
                quantity: Number(item.quantity),
                price
            });
        }

        const totalAmount = foodItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        if (!Number.isFinite(totalAmount)) {
            return res.status(400).json({
                success: false,
                message: "Unable to calculate order total"
            });
        }

        const instructions = deliveryInstructions?.trim() || "";

        if (instructions) {
            const moderationResult = await isAppropriate(instructions);

            if (!moderationResult?.appropriate) {
                return res.status(400).json({
                    success: false,
                    message: "Inappropriate delivery instruction"
                });
            }
        }

        const fullAddress =
            `${address.street}, ${address.city}, ${address.postalCode}`;

        const coordinate = await getCoordinates(fullAddress);

        if (
            !coordinate ||
            !Number.isFinite(Number(coordinate.longitude)) ||
            !Number.isFinite(Number(coordinate.latitude))
        ) {
            return res.status(400).json({
                success: false,
                message: "Unable to find coordinates for this address"
            });
        }

        const newOrder = await Order.create({
            user: user._id,
            orderItems: foodItems,
            address: {
                street: address.street,
                city: address.city,
                postalCode: address.postalCode,
                location: {
                    type: "Point",
                    coordinates: [
                        Number(coordinate.longitude),
                        Number(coordinate.latitude)
                    ]
                }
            },
            deliveryInstructions: instructions,
            paymentMethod,
            totalAmount
        });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            userInfo: {
                username: user.username,
                email: user.email,
                id: user._id
            },
            orderInfo: {
                newOrder
            }
        });

    } catch (error) {
        console.log("Place Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred"
        });
    }
}

export async function ConfirmOrder(req, res) {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Order cannot be confirmed"
            });
        }

        order.orderStatus = "confirmed";
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order confirmed successfully",
            order
        });

    } catch (error) {
        console.error("Confirm Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred"
        });
    }
}

export async function OrderCompleted(req, res) {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus !== "confirmed") {
            return res.status(400).json({
                success: false,
                message: "Order cannot be completed"
            });
        }

        order.orderStatus = "completed";
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order completed successfully",
            order
        });

    } catch (error) {
        console.error("Complete Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred"
        });
    }
}

export async function addItem(req, res) {
    try {
        const { orderId, foodId } = req.body;

        if (!orderId || !foodId) {
            return res.status(400).json({
                success: false,
                message: "orderId and foodId are required"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Items cannot be added to this order"
            });
        }

        const foodItem = await Food.findById(foodId);

        if (!foodItem) {
            return res.status(404).json({
                success: false,
                message: "Food item not found"
            });
        }

        const existingItem = order.orderItems.find(
            item => item.food.toString() === foodItem._id.toString()
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            order.orderItems.push({
                food: foodItem._id,
                quantity: 1,
                price: Number(foodItem.price)
            });
        }

        order.totalAmount = order.orderItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Item added successfully",
            order
        });

    } catch (error) {
        console.error("Add Item Error:", error);

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred"
        });
    }
}

export async function cancelOrder(req, res) {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This order cannot be cancelled"
            });
        }

        order.orderStatus = "cancelled";
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        console.error("Cancel Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred"
        });
    }
}

export async function getPendingOrder(req, res) {
    try {
        const { email } = req.body;
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "User is logged out"
            });
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account with this email does not exist"
            });
        }

        const session = await Session.findOne({
            user: user._id,
            revoked: false
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "User is unauthorized"
            });
        }

        const isValidRefreshToken = await bcrypt.compare(
            refreshToken,
            session.refreshToken
        );

        if (!isValidRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        const orders = await Order.find({
            user: user._id,
            orderStatus: "pending"
        });

        return res.status(200).json({
            success: true,
            message: orders.length
                ? "Orders found"
                : "No pending orders available",
            orders
        });

    } catch (error) {
        console.error("Get Pending Orders Error:", error);

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred"
        });
    }
}

export async function updateDeliveryInstruction(req, res) {
    try {
        const { newDeliveryInstructions, orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        if (!newDeliveryInstructions?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Delivery instructions are required"
            });
        }

        const moderationResult = await isAppropriate(
            newDeliveryInstructions
        );

        if (!moderationResult?.appropriate) {
            return res.status(400).json({
                success: false,
                message: "Inappropriate delivery instruction"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Delivery instructions cannot be changed now"
            });
        }

        order.deliveryInstructions = newDeliveryInstructions.trim();

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Delivery instructions updated successfully",
            order
        });

    } catch (error) {
        console.error("Update Delivery Instruction Error:", error);

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred"
        });
    }
}

export async function updateDeliveryAddress(req, res) {
    try {
        const { orderId, newDeliveryAddress } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        if (
            !newDeliveryAddress?.street ||
            !newDeliveryAddress?.city ||
            !newDeliveryAddress?.postalCode
        ) {
            return res.status(400).json({
                success: false,
                message: "Complete delivery address is required"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Delivery address cannot be changed now"
            });
        }

        const address = `${newDeliveryAddress.street}, ${newDeliveryAddress.city}, ${newDeliveryAddress.postalCode}`;

        const coordinate = await getCoordinates(address);

        if (
            !coordinate ||
            !Number.isFinite(Number(coordinate.longitude)) ||
            !Number.isFinite(Number(coordinate.latitude))
        ) {
            return res.status(400).json({
                success: false,
                message: "Unable to find coordinates for this address"
            });
        }

        order.address = {
            street: newDeliveryAddress.street,
            city: newDeliveryAddress.city,
            postalCode: newDeliveryAddress.postalCode,
            location: {
                type: "Point",
                coordinates: [
                    Number(coordinate.longitude),
                    Number(coordinate.latitude)
                ]
            }
        };

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Delivery address updated successfully",
            order
        });

    } catch (error) {
        console.error("Update Delivery Address Error:", error);

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred"
        });
    }
}

export async function getAllOrders(req,  res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email }).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const orders = await Order.find({
            user: user._id
        }).sort({
            createdAt: -1
        });

        const message = orders.length
            ? "Orders retrieved successfully"
            : "No past orders found";

        return res.status(200).json({
            success: true,
            message,
            orders,
            user
        });

    } catch (error) {
        console.error("Get All Orders Error:", error);

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred"
        });
    }
}
