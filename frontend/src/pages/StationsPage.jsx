// src/pages/StationsPage.jsx
//
// Shows all active recycling stations with an OpenStreetMap map.
// Uses Leaflet + react-leaflet. 

import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { stationService } from "../services/stationService";
import { useTranslation } from "react-i18next";

// Fix Leaflet markers, as Vite defaults fail
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
    iconUrl:       new URL("leaflet/dist/images/marker-icon.png",    import.meta.url).href,
    shadowUrl:     new URL("leaflet/dist/images/marker-shadow.png",  import.meta.url).href,
});

// Default map center when no stations are loaded yet
const ASTURIAS_CENTER = [43.3614, -5.8593];
const DEFAULT_ZOOM = 11;

const StationsPage = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const data = await stationService.getActiveStations();
                setStations(data);
            } catch (err) {
                setError(t("stations.errorLoading") + err.message);
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
                {t("stations.loading")}
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
        <div className="max-w-5xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-green-400 mb-2">
                {t("stations.title")}
            </h1>
            <p className="text-gray-400 text-sm mb-6">
                {t("stations.activeStations", { count: stations.length })}
            </p>

            {/* Map container */}
            <div className="rounded-xl overflow-hidden border border-gray-800" style={{ height: "520px" }}>
                <MapContainer
                    center={ASTURIAS_CENTER}
                    zoom={DEFAULT_ZOOM}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {stations.map((station) => (
                        <StationMarker key={station.id} station={station} />
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

const StationMarker = ({ station }) => {
    return (
        <Marker position={[station.latitude, station.longitude]}>
            <Popup>
                <div style={{ minWidth: "160px" }}>
                    <p style={{ fontWeight: "600", marginBottom: "4px" }}>{station.name}</p>
                    <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>{station.address}</p>
                </div>
            </Popup>
        </Marker>
    );
};

export default StationsPage;