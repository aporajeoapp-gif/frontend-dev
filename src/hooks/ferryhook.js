import { useCallback, useState } from "react";
import { getAllFerries } from "../api/ferryApi";

export default function useFerries() {
    const [ferries, setFerries] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFerries = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const response = await getAllFerries(params);
            if (response.data) {
                setFerries(response.data);
                setPagination(response.pagination);
            } else {
                setFerries(response);
            }
            return response;
        } catch (err) {
            setError(err);
            console.error("Error fetching ferries:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        ferries,
        pagination,
        setFerries,
        loading,
        error,
        refresh: fetchFerries
    };
}
