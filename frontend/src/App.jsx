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
import MedicineDetail from "./pages/MedicineDetail/MedicineDetail";
import AllMedicines from "./pages/AllMedicines/AllMedicines";
import Profile from "./pages/Profile/Profile";
import Background from "./components/Background/Background";

function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Background />
      {showLogin ? <LoginPage setShowLogin={setShowLogin} /> : null}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/prescription" element={<Prescription />} />
          <Route path="/medicine/:id" element={<MedicineDetail />} />
          <Route path="/medicines" element={<AllMedicines />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
