import { Navbar } from "./components/Navbar/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Footer from "./components/Footer/Footer";
import { useState } from "react";
import LoginPage from "./components/LoginPage/LoginPage";
import Payment from "./pages/Payment/Payment";
import MyOrders from "./pages/MyOrders/MyOrders";
import Prescription from "./pages/Prescription/Prescription";

function App() {

  const [showLogin, setShowLogin] = useState(false)
  const [search, setSearch] = useState("");

  return (
    <>
    {showLogin?<LoginPage setShowLogin={setShowLogin}  />:<></>}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} setSearch={setSearch} />
        <Routes>
          <Route path="/" element={<Home search={search} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/myorders" element={<MyOrders/>}/>
          <Route path="/prescription" element={<Prescription />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
