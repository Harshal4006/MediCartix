/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { medicine_list as staticMedicineList } from "../assets/medicine_list.js";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [medicine_list, setMedicineList] = useState(staticMedicineList);
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [medicineLoading, setMedicineLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const api = useMemo(() => axios.create({
    baseURL: url,
    withCredentials: true,
  }), [url]);

  const fetchMedicineList = useCallback(async () => {
    try {
      setMedicineLoading(true);
      const response = await api.get("/api/medicine/list");

      if (response.data.success && response.data.data.length > 0) {
        setMedicineList(response.data.data);
      }
    } catch (error) {
      console.error("Medicine Fetch Error:", error?.response?.data?.message || error.message);
    } finally {
      setMedicineLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchMedicineList();
  }, [fetchMedicineList]);

  const loadCartData = useCallback(async () => {
    try {
      const response = await api.post("/api/cart/get", {});
      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (_) {
      console.error("Cart Load Error:", _?.response?.data?.message || _.message);
    }
  }, [api]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.post("/api/user/me", {});
      if (response.data.success) {
        setUser(response.data.user);
        setToken(response.data.token || "");
        return response.data;
      }
    } catch {
      setToken("");
      setUser(null);
      setCartItems({});
    } finally {
      setAuthChecked(true);
    }
  }, [api]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await api.post("/api/user/login", { email, password });
    if (response.data.success) {
      setToken(response.data.token);
      if (response.data.user) {
        setUser(response.data.user);
      }
    }
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/api/user/register", { name, email, password });
    if (response.data.success) {
      setToken(response.data.token);
      if (response.data.user) {
        setUser(response.data.user);
      }
    }
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/api/user/logout", {});
    } catch (error) {
      console.error("Logout error:", error);
    }
    setToken("");
    setUser(null);
    setCartItems({});
    toast.info("Logged out");
  };

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      try {
        await api.post("/api/cart/add", { itemId });
      } catch (error) {
        console.error("Add Cart Error:", error?.response?.data?.message || error.message);
      }
    }
    toast("Added to cart", { icon: "🛒", style: { background: "#f0fdf4", color: "#15803d" } });
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });

    if (token) {
      try {
        await api.post("/api/cart/remove", { itemId });
      } catch (error) {
        console.error("Remove Cart Error:", error?.response?.data?.message || error.message);
      }
    }
    toast("Removed from cart", { icon: "🗑️", style: { background: "#fef2f2", color: "#dc2626" } });
  };

  useEffect(() => {
    if (token) {
      loadCartData(token);
    } else {
      setCartItems({});
      setUser(null);
    }
  }, [token, loadCartData]);

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = medicine_list.find((product) => product._id === itemId);
      if (itemInfo) {
        totalAmount += itemInfo.price * cartItems[itemId];
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((total, qty) => total + qty, 0);
  };

  const contextValue = {
    url,
    api,
    token,
    setToken,
    user,
    setUser,
    medicine_list,
    medicineLoading,
    authChecked,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
    loading,
    setLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
