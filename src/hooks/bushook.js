import { useCallback, useState } from "react";
import { getAllBuses } from "../api/busApi";
// import { getAllBuses } from "../api/busapi";

export default function useBuses() {
  const [buses, setBuses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBuses = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await getAllBuses(params);
      if (response.data) {
        setBuses(response.data);
        setPagination(response.pagination);
      } else {
        setBuses(response);
      }
      return response;
    } catch (err) {
      setError(err);
      console.error("Error fetching buses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    buses,
    pagination,
    setBuses,
    loading,
    error,
    refresh: fetchBuses,
  };
}
