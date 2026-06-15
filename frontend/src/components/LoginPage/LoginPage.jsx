import React, { useState, useContext } from "react";
import "./LoginPage.css";
import cross_icon from "../../assets/images/cross_icon.png";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";

const LoginPage = ({ setShowLogin }) => {
  const { api, setToken, setUser } = useContext(StoreContext);

  const [currState, setCurrState] = useState("Sign Up");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const errs = {};
    if (currState === "Sign Up" && !data.name.trim()) {
      errs.name = "Name is required";
    }
    if (!data.email.trim()) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errs.email = "Invalid email format";
    }
    if (!data.password) {
      errs.password = "Password is required";
    } else if (data.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);

    const endpoint = currState === "Login" ? "/api/user/login" : "/api/user/register";

    try {
      const res = await api.post(endpoint, data);

      if (res.data.success) {
        setToken(res.data.token);
        if (res.data.user) {
          setUser(res.data.user);
        }

        toast.success(
          currState === "Login" ? "Welcome back!" : "Account created successfully"
        );

        setShowLogin(false);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    }

    setLoading(false);
  };

  return (
    <div className="login-popup" onClick={() => setShowLogin(false)}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={onSubmitHandler} className="login-popup-container" role="dialog" aria-modal="true" aria-label={currState}>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img src={cross_icon} alt="Close" onClick={() => setShowLogin(false)} />
        </div>

        <div className="login-popup-inputs">
          {currState !== "Login" && (
            <div className="input-wrapper">
              <input
                name="name"
                value={data.name}
                onChange={onChangeHandler}
                type="text"
                placeholder="Your Name"
                className={errors.name ? "input-error" : ""}
                required
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          )}

          <div className="input-wrapper">
            <input
              name="email"
              value={data.email}
              onChange={onChangeHandler}
              type="email"
              placeholder="Your Email"
              className={errors.email ? "input-error" : ""}
              required
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="input-wrapper">
            <input
              name="password"
              value={data.password}
              onChange={onChangeHandler}
              type="password"
              placeholder="Your Password"
              className={errors.password ? "input-error" : ""}
              required
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Please Wait..." : currState === "Sign Up" ? "Create Account" : "Login"}
        </button>

        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>

        {currState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => { setCurrState("Sign Up"); setErrors({}); }}>
              Click here
            </span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => { setCurrState("Login"); setErrors({}); }}>
              Login here
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPage;
