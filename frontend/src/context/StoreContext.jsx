import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {

  const url = "http://localhost:4000";

  // AUTH STATE

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);


  // MEDICINE DATA

  const [medicine_list, setMedicineList] = useState([]);

  const fetchMedicineList = async () => {
    try {
      const response = await axios.get(`${url}/api/medicine/list`);

      if (response.data.success) {
        setMedicineList(response.data.data);
      }

    } catch (error) {
      console.log("Medicine Fetch Error:", error.message);
    }
  };

  useEffect(() => {
    fetchMedicineList();
  }, []);


  // CART STATE

  const [cartItems, setCartItems] = useState({});


  // LOAD CART FROM DB


  const loadCartData = async (token) => {
    try {

      const response = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setCartItems(response.data.cartData);
      }

    } catch (error) {
      console.log("Cart Load Error:", error.message);
    }
  };


  // CART FUNCTIONS

  const addToCart = async (itemId) => {

    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      try {
        await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { token } }
        );
      } catch (error) {
        console.log("Add Cart Error:", error.message);
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
        await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { token } }
        );
      } catch (error) {
        console.log("Remove Cart Error:", error.message);
      }
    }
  };


  // LOAD CART AFTER LOGIN


  useEffect(() => {
    if (token) {
      loadCartData(token);
    }
  }, [token]);


  // CART CALCULATIONS

  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const itemId in cartItems) {

      const itemInfo = medicine_list.find(
        (product) => product._id === itemId
      );

      if (itemInfo) {
        totalAmount += itemInfo.price * cartItems[itemId];
      }
    }

    return totalAmount;
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce(
      (total, qty) => total + qty,
      0
    );
  };


  // CONTEXT VALUE

  const contextValue = {
    url,
    token,
    setToken,
    medicine_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;