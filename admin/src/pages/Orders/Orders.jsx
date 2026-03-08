import React, { useEffect, useState } from "react";
import "./Orders.css";
import axios from "axios";
import { BsBoxSeam } from "react-icons/bs";

const Orders = () => {
  const url = "https://medicartix-backend.onrender.com";

  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const response = await axios.get(`${url}/api/order/list`);

    if (response.data.success) {
      setOrders(response.data.data);
      console.log(response.data.data);
    }
  };

  const statusHandler = async (event, orderId) => {
    await axios.post(`${url}/api/order/status`, {
      orderId,
      status: event.target.value,
    });

    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="orders">
      <h2>Orders</h2>

      <div className="orders-container">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div className="order-item" key={order._id}>
              <BsBoxSeam className="order-icon" />

              <div className="order-items">
                {order.items.map((item, i) => (
                  <p key={i}>
                    {item.name} x {item.quantity}
                  </p>
                ))}
              </div>

              <p>₹{order.amount}</p>

              <p>{order.address?.city}</p>

              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
              >
                <option value="Processing">Processing</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        ) : (
          <p>No Orders Found</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
