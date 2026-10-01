import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        orderItems: [
            {
                food: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Food",
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],

        address: {
            street: {
                type: String,
                required: true,
                trim: true
            },

            city: {
                type: String,
                required: true,
                trim: true
            },

            postalCode: {
                type: String,
                required: true,
                trim: true
            },

            location: {
                type: {
                    type: String,
                    enum: ["Point"],
                    default: "Point"
                },

                coordinates: {
                    type: [Number],
                    required: true
                }
            }
        },

        deliveryInstructions: {
            type: String,
            trim: true,
            default: ""
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "upi", "card"],
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending"
        },

        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "preparing",
                "out_for_delivery",
                "completed",
                "cancelled"
            ],
            default: "pending"
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

orderSchema.index({
    "address.location": "2dsphere"
});

const Order = mongoose.model("Order", orderSchema);

export default Order;