import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [medicine_list, setMedicineList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [medicineLoading, setMedicineLoading] = useState(true);

  const api = axios.create({ baseURL: url });

  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const fetchMedicineList = useCallback(async () => {
    try {
      setMedicineLoading(true);
      const response = await api.get("/api/medicine/list");

      if (response.data.success) {
        setMedicineList(response.data.data);
      }
    } catch (error) {
      console.error("Medicine Fetch Error:", error?.response?.data?.message || error.message);
    } finally {
      setMedicineLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicineList();
  }, [fetchMedicineList]);

  const loadCartData = useCallback(async (token) => {
    try {
      const response = await api.post("/api/cart/get", {});
      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (error) {
      console.error("Cart Load Error:", error?.response?.data?.message || error.message);
    }
  }, [api]);

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
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      loadCartData(token);
    } else {
      localStorage.removeItem("token");
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
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
    loading,
    setLoading,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
