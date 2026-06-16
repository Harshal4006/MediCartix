import React from "react";
import Navbar from "./component/Navbar/Navbar";
import Sidebar from "./component/Sidebar/Sidebar";
import { Route, Routes, Navigate } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Prescriptions from "./pages/Prescriptions/Prescriptions";
import Login from "./pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProtectedRoute = ({ children }) => {
  const hasToken = !!localStorage.getItem("adminToken");
  if (!hasToken) return <Navigate to="/login" replace />;
  return children;
};

const AdminLayout = () => (
  <>
    <Navbar />
    <hr />
    <div className="app-content">
      <Sidebar />
      <div className="page-content">
        <Routes>
          <Route path="/add" element={<Add />} />
          <Route path="/list" element={<List />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/" element={<Navigate to="/add" replace />} />
        </Routes>
      </div>
    </div>
  </>
);

const App = () => {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
