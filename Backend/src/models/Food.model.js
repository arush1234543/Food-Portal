import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        subcategory: {
            type: String,
            required: true,
            trim: true
        },

        cuisine: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            required: true,
            default: "INR",
            enum: ["INR"]
        },

        image: {
            type: String,
            required: true,
            trim: true
        },

        vegetarian: {
            type: Boolean,
            required: true
        },

        vegan: {
            type: Boolean,
            required: true
        },

        spicy: {
            type: Boolean,
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 0,
            max: 5
        },

        reviewCount: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        preparationTime: {
            type: Number,
            required: true,
            min: 1
        },

        calories: {
            type: Number,
            required: true,
            min: 0
        },

        serves: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },

        available: {
            type: Boolean,
            default: true
        },

        tags: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    });

const Food = mongoose.model("Food", foodSchema);

export default Food;