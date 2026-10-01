import { findFood } from "../services/search.service.js";
import Food from "../models/Food.model.js"

export async function getFoodItems(req, res) {
    try {
        const data = await Food.find()
        if (!data) {
            return res.status(500).json({
                succes: false,
                message: "An unexpected error occured"
            })
        }

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No food items found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Fetch successfully",
            foodItems: data
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "An unexpected error occured"
        })
    }
}

export async function GetFoodById(req, res) {
    const { id } = req.params
    try{

        
        if(!id){
        return res.status(500).json({
            message: "An unexpected error occured",
            success: false
        })
    }

    const foodItem = await Food.findById(id)

    if(!foodItem){
        return res.status(400).json({
            message: "Invalid id",
            success: true
        })
    }

    return res.status(200).json({
        success: true,
        message: "Food Item fetched successfully",
        foodItem
    })
}
catch(err){
    return res.status(500).json({
        success: false,
        message: "An internal server error occured",
        error: err.message
    })
}

}


export async function searchFood(req, res) {
    try {
        const { query } = req.body;

        if (typeof query !== "string" || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const filters = await findFood(query);

        if (!filters) {
            return res.status(400).json({
                success: false,
                message: "Unable to understand search query"
            });
        }

        let mongoQuery = {
            available: true
        };

        if (filters.search) {
            mongoQuery.$or = [
                {
                    name: {
                        $regex: filters.search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: filters.search,
                        $options: "i"
                    }
                },
                {
                    tags: {
                        $regex: filters.search,
                        $options: "i"
                    }
                }
            ];
        }

        if (filters.cuisine) {
            mongoQuery.cuisine = {
                $regex: filters.cuisine,
                $options: "i"
            };
        }

        if (filters.category) {
            mongoQuery.category = {
                $regex: filters.category,
                $options: "i"
            };
        }

        if (filters.vegetarian !== null) {
            mongoQuery.vegetarian = filters.vegetarian;
        }

        if (filters.vegan !== null) {
            mongoQuery.vegan = filters.vegan;
        }

        if (filters.spicy !== null) {
            mongoQuery.spicy = filters.spicy;
        }

        if (
            filters.maxPrice !== null ||
            filters.minPrice !== null
        ) {
            mongoQuery.price = {};

            if (filters.maxPrice !== null) {
                mongoQuery.price.$lte = filters.maxPrice;
            }

            if (filters.minPrice !== null) {
                mongoQuery.price.$gte = filters.minPrice;
            }
        }

        if (filters.minRating !== null) {
            mongoQuery.rating = {
                $gte: filters.minRating
            };
        }

        if (filters.tags.length > 0) {
            mongoQuery.tags = {
                $all: filters.tags
            };
        }

        let results = await Food.find(mongoQuery)
            .sort({
                rating: -1,
                reviewCount: -1
            })
            .limit(20);

        if (results.length > 0) {
            return res.status(200).json({
                success: true,
                suggested: false,
                filters,
                data: results
            });
        }

        const fallbackFilters = structuredClone(filters);

        const removableFilters = [
            "maxPrice",
            "minPrice",
            "minRating",
            "spicy",
            "tags",
            "category",
            "cuisine"
        ];

        for (const filter of removableFilters) {
            if (
                fallbackFilters[filter] === null ||
                fallbackFilters[filter] === undefined ||
                (
                    Array.isArray(fallbackFilters[filter]) &&
                    fallbackFilters[filter].length === 0
                )
            ) {
                continue;
            }

            fallbackFilters[filter] = Array.isArray(fallbackFilters[filter])
                ? []
                : null;

            mongoQuery = {
                available: true
            };

            if (fallbackFilters.search) {
                mongoQuery.$or = [
                    {
                        name: {
                            $regex: fallbackFilters.search,
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: fallbackFilters.search,
                            $options: "i"
                        }
                    },
                    {
                        tags: {
                            $regex: fallbackFilters.search,
                            $options: "i"
                        }
                    }
                ];
            }

            if (fallbackFilters.cuisine) {
                mongoQuery.cuisine = {
                    $regex: fallbackFilters.cuisine,
                    $options: "i"
                };
            }

            if (fallbackFilters.category) {
                mongoQuery.category = {
                    $regex: fallbackFilters.category,
                    $options: "i"
                };
            }

            if (fallbackFilters.vegetarian !== null) {
                mongoQuery.vegetarian = fallbackFilters.vegetarian;
            }

            if (fallbackFilters.vegan !== null) {
                mongoQuery.vegan = fallbackFilters.vegan;
            }

            if (fallbackFilters.spicy !== null) {
                mongoQuery.spicy = fallbackFilters.spicy;
            }

            if (
                fallbackFilters.maxPrice !== null ||
                fallbackFilters.minPrice !== null
            ) {
                mongoQuery.price = {};

                if (fallbackFilters.maxPrice !== null) {
                    mongoQuery.price.$lte = fallbackFilters.maxPrice;
                }

                if (fallbackFilters.minPrice !== null) {
                    mongoQuery.price.$gte = fallbackFilters.minPrice;
                }
            }

            if (fallbackFilters.minRating !== null) {
                mongoQuery.rating = {
                    $gte: fallbackFilters.minRating
                };
            }

            if (fallbackFilters.tags.length > 0) {
                mongoQuery.tags = {
                    $all: fallbackFilters.tags
                };
            }

            results = await Food.find(mongoQuery)
                .sort({
                    rating: -1,
                    reviewCount: -1
                })
                .limit(20);

            if (results.length > 0) {
                return res.status(200).json({
                    success: true,
                    suggested: true,
                    originalFilters: filters,
                    filters: fallbackFilters,
                    data: results
                });
            }
        }

        return res.status(200).json({
            success: true,
            suggested: false,
            filters,
            data: [],
            message: "No matching food found"
        });
    } catch (error) {
        console.error("Food Search Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to search food"
        });
    }
}