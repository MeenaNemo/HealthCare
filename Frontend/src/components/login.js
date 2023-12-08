import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import logoImage from "../logo/logo.jpg";

const Login = () => {
  const history = useHistory();

  const [loginData, setLoginData] = useState({
    loginIdentifier: "",
    password: "",
  });

  const [alertMessage, setAlertMessage] = useState(null); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://api.5ytechno.com/login",
        loginData
      );
      console.log(response.data);
      if (response.data.status === 200) {
        setAlertMessage("Login Successful!");
        setTimeout(() => {
          setAlertMessage(null); 
          localStorage.setItem("user", JSON.stringify(response.data.data));
          history.push("/sidebar");
          window.location.reload();
        }, 2000);
      }
    } 
  catch (error) {
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
      setTimeout(() => {
        setAlertMessage(null); 
      }, 2000);
    } else {
      console.error("An unexpected error occurred:", error);
      setAlertMessage("An unexpected error occurred. Please try again.");
      setTimeout(() => {
        setAlertMessage(null); 
      }, 2000);
    }
  }
  };

  const alertStyle = {
    position: "fixed",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "green", 
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
    zIndex: "9999",
    display: alertMessage ? "block" : "none", 
    opacity: alertMessage ? 1 : 0, 
    transition: "opacity 0.5s ease-in-out", 
  };
  
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: `url('../Assets/e.jpeg')`,
        backgroundSize: "100% 100%",
        minHeight: "100vh",
        backgroundRepeat: "no-repeat",
        fontFamily:'serif'
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
        <div style={alertStyle}>{alertMessage}</div>

        
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
            <button type="submit" className="btn" style={{backgroundColor:'teal', color:'white'}}>
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
