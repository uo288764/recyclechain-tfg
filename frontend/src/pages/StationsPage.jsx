// src/pages/StationsPage.jsx
//
// Displays all active recycling stations fetched from the backend.
// Shows station name, address and a link to Google Maps coordinates.

import { useState, useEffect } from "react";
import { MapPin, Loader } from "lucide-react";
import { stationService } from "../services/stationService";

const StationsPage = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const data = await stationService.getActiveStations();
                setStations(data);
            } catch (err) {
                setError("Error loading stations: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] gap-2 text-gray-400">
                <Loader size={20} className="animate-spin" />
                Loading stations...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-green-400 mb-2">
                Recycling Stations
            </h1>
            <p className="text-gray-400 text-sm mb-8">
                {stations.length} active station{stations.length !== 1 ? "s" : ""} available
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stations.map((station) => (
                    <StationCard key={station.id} station={station} />
                ))}
            </div>
        </div>
    );
};

const StationCard = ({ station }) => {
    const mapsUrl = `https://www.google.com/maps?q=${station.latitude},${station.longitude}`;

    return (
        <div className="bg-gray-900 border border-gray-800 hover:border-green-800 rounded-xl p-5 transition-colors">
            <div className="flex items-start gap-3">
                <div className="text-green-400 mt-0.5">
                    <MapPin size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{station.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{station.address}</p>
                    
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 hover:text-green-400 text-xs font-mono transition-colors"
                    <a>
                        {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)} →
                    </a>
                </div>
            </div>
        </div>
    );
};

export default StationsPage;