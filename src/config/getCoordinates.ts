import axios from "axios";
import dotenv from "dotenv";
import { eventLocation } from "./enum/dto";

dotenv.config();

interface GeocodeResponse {
    status: string;
    results: {
        geometry: {
            location: { lat: number; lng: number };
        };
    }[];
}

export async function getCoordinates(address: string): Promise<eventLocation | null> {
    console.log("Get Address",address)
    const API_KEY = process.env.LOCATION_API_KEY;
    console.log("API_KEY",API_KEY);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;

    try {
        const response = await axios.get<GeocodeResponse>(url);
        if (response.data.status === "OK") {
           
            return { type: 'Point', coordinates: [response.data.results[0].geometry.location.lng, response.data.results[0].geometry.location.lat] };
        } else {
            throw new Error("Invalid address");
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
}
