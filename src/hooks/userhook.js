import { useEffect, useState } from "react";
import { getUser, getAllUsers } from "../api/authApi";

export default function fetchUser() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUser();
      setProfile(data.user);
    } catch (error) {
      return error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return { profile, loading };
}

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = async (params = {}) => {
    try {
      setLoading(true);
      const response = await getAllUsers(params);
      if (response.data) {
        setUsers(response.data);
        setPagination(response.pagination);
      } else {
        setUsers(response);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const addUser = (user) => setUsers((prev) => [user, ...prev]);

  const updateUser = (id, updated) =>
    setUsers((prev) => prev.map((u) => (u._id || u.id) === id ? updated : u));

  const removeUser = (id) =>
    setUsers((prev) => prev.filter((u) => (u._id || u.id) !== id));

  return { users, pagination, loading, addUser, updateUser, removeUser, refresh: loadUsers };
}