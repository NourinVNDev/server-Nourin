import axios from "axios";
import { eventLocation } from "./enum/dto";

interface MapboxResponse {
    features: { center: [number, number] }[];
}

export async function getCoordinates(address: string): Promise<eventLocation | null> {
    console.log("Get Address:", address);
    
    const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
    console.log("MAPBOX_ACCESS_TOKEN:", MAPBOX_ACCESS_TOKEN);

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;

    try {
        const response = await axios.get<MapboxResponse>(url);
        
        if (response.data.features.length > 0) {
            const [lng, lat] = response.data.features[0].center;
            return { type: "Point", coordinates: [lng, lat] };
        } else {
            throw new Error("Invalid address");
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
}
