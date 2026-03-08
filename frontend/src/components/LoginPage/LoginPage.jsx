import React, { useState, useContext } from "react";
import "./LoginPage.css";
import cross_icon from "../../assets/images/cross_icon.png";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";

const LoginPage = ({ setShowLogin }) => {

  const url = "https://medicartix-backend.onrender.com";

  const { setToken } = useContext(StoreContext);

  const [currState, setCurrState] = useState("Sign Up");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    const endpoint =
      currState === "Login"
        ? "/api/user/login"
        : "/api/user/register";

    try {
      const { data: res } = await axios.post(
        `${url}${endpoint}`,
        data
      );

      if (res.success) {

        setToken(res.token);
        localStorage.setItem("token", res.token);

        toast.success(
          currState === "Login"
            ? "Login Successful"
            : "Account Created Successfully"
        );

        setShowLogin(false);

      } else {
        toast.error(res.message);
      }

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Server Error"
      );
    }

    setLoading(false);
  };

  return (
    <div className="login-popup">
      <form onSubmit={onSubmitHandler} className="login-popup-container">

        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img
            src={cross_icon}
            alt=""
            onClick={() => setShowLogin(false)}
          />
        </div>

        <div className="login-popup-inputs">

          {currState !== "Login" && (
            <input
              name="name"
              value={data.name}
              onChange={onChangeHandler}
              type="text"
              placeholder="Your Name"
              required
            />
          )}

          <input
            name="email"
            value={data.email}
            onChange={onChangeHandler}
            type="email"
            placeholder="Your Email"
            required
          />

          <input
            name="password"
            value={data.password}
            onChange={onChangeHandler}
            type="password"
            placeholder="Your Password"
            required
          />

        </div>

        <button type="submit">
          {loading
            ? "Please Wait..."
            : currState === "Sign Up"
            ? "Create Account"
            : "Login"}
        </button>

        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>
            By continuing, I agree to the terms of use & privacy policy.
          </p>
        </div>

        {currState === "Login" ? (
          <p>
            Create a new account?
            <span onClick={() => setCurrState("Sign Up")}>
              Click here
            </span>
          </p>
        ) : (
          <p>
            Already have an account?
            <span onClick={() => setCurrState("Login")}>
              Login here
            </span>
          </p>
        )}

      </form>
    </div>
  );
};

export default LoginPage;
