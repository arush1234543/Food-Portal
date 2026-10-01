import mongoose from "mongoose";

const SellerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        contact: {
            phone: {
                type: String,
                required: [true, "Phone number is a required field"],
                trim: true
            },
            email: {
                type: String,
                required: [true, "Email is a required field"],
                trim: true,
                lowercase: true
            }
        },

        shops: [
            {
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

                description: {
                    type: String,
                    trim: true
                },

                employees: [
                    {
                        name: {
                            type: String,
                            required: true,
                            trim: true
                        },

                        age: {
                            type: Number
                        }
                    }
                ]
            }
        ]
    },
    {
        timestamps: true
    }
);

SellerSchema.index({
    "shops.address.location": "2dsphere"
});

const Seller = mongoose.model("Seller", SellerSchema);

export default Seller