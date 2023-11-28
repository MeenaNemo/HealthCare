import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import logoImage from "../logo/logo.jpg"; // Adjust the path as needed

const Login = () => {
  const history = useHistory();

  const [loginData, setLoginData] = useState({
    loginIdentifier: "",
    password: "",
  });

  const [alertMessage, setAlertMessage] = useState(null); // State for managing alerts

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/login",
        loginData
      );
      console.log(response.data);
      if (response.data.status === 200) {
        setAlertMessage("Login Successful!"); // Set success message
        localStorage.setItem("user", JSON.stringify(response.data.data));
        history.push("/sidebar");
        window.location.reload();
      }
      // Handle successful login - set token in local storage and redirect
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response && error.response.status === 401) {
        const errorMessage = error.response.data.message;
        if (errorMessage === "Invalid username or password") {
          setAlertMessage("Invalid username or password");
        } else if (errorMessage === "Invalid username") {
          setAlertMessage("Invalid username or password");
        } else if (errorMessage === "Invalid password") {
          setAlertMessage("Invalid password.");
        } else {
          setAlertMessage("An unexpected error occurred. Please try again.");
        }
      } else {
        console.error("An unexpected error occurred:", error);
        setAlertMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: `url('../Assets/e.jpeg')`,
        backgroundSize: "100% 100%",
        minHeight: "100vh",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="p-4 border-0 shadow"
        style={{ minWidth: "300px", maxWidth: "400px" }}
      >
        <div className="text-center mb-4">
          <img
            src={logoImage}
            alt="Profile"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
          <h2 className="mt-3 mb-0">
            {" "}
            <b>Log in to your account</b>
          </h2>
          <p className="text-secondary">
            Welcome back! Please enter your details
          </p>
        </div>
        {alertMessage && ( // Display alert message if present
          <div className="alert alert-info mb-3" role="alert">
            {alertMessage}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="loginIdentifier" className="form-label">
              <b>Email/Mobile number</b>
            </label>
            <input
              type="text"
              id="loginIdentifier"
              name="loginIdentifier"
              placeholder="Email or Mobile Number"
              className="form-control"
              value={loginData.loginIdentifier}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              <b>Password</b>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              className="form-control"
              value={loginData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="text-center">
            <button type="submit" className="btn btn-info">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
