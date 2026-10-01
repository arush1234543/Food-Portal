import axios from "axios";

export async function getCoordinates(location) {
    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: location,
                format: "jsonv2",
                limit: 1
            },
            headers: {
                "User-Agent": "MyFoodApp/1.0"
            }
        }
    );

    if (!response.data.length) {
        throw new Error("Location not found");
    }

    return {
        latitude: Number(response.data[0].lat),
        longitude: Number(response.data[0].lon)
    };
}