import { useEffect, useState } from "react";

import { getAllEmergencyServices } from "../api/emergencyApi";

export default function useEmergencyServices() {
    const [emergencies, setEmergencies] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEmergencies = async (params = {}) => {
        try {
            setLoading(true);
            const response = await getAllEmergencyServices(params);
            if (response.data) {
                setEmergencies(response.data);
                setPagination(response.pagination);
            } else {
                setEmergencies(response);
            }
            return response;
        } catch (err) {
            setError(err);
            console.error("Error fetching emergencies:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        emergencies,
        pagination,
        setEmergencies,
        loading,
        error,
        refresh: fetchEmergencies
    };
}
