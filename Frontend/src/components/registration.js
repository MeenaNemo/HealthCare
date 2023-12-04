import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const RegistrationForm = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileNumberRegex = /^\d{10}$/;


  const [formData, setFormData] = useState({
    user_first_name: "",
    user_last_name: "",
    user_email: "",
    user_mobile_number: "",
    user_role: "",
    user_password: "",
    user_profile_photo: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (
      !formData.user_first_name ||
      !formData.user_last_name ||
      !emailRegex.test(formData.user_email) ||
      !mobileNumberRegex.test(formData.user_mobile_number) ||
      !formData.user_role ||
      !formData.user_password
    ) {
      alert("Please fill in all fields with valid information.");
      return;
    }
  
    if (!emailRegex.test(formData.user_email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!mobileNumberRegex.test(formData.user_mobile_number)) {
      alert("Mobile number must be 10 digits long.");
      return;
    }
  
    try {
      const checkEmailResponse = await axios.get(
        `http://localhost:3000/check-email?email=${formData.user_email}`
      );
  
      if (checkEmailResponse.data.status === 400) {
        alert("Email is already registered. Please use a different email address.");
        setFormData({ ...formData, user_email: "" });
        return;
      }
  
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }
  
      const response = await axios.post(
        "http://localhost:3000/register",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      console.log(response.data);
      if (response.data.status === 200) {
        alert("Registration successful!");

        setFormData({
          user_first_name: "",
          user_last_name: "",
          user_email: "",
          user_mobile_number: "",
          user_role: "",
          user_password: "",
          user_profile_photo: null,
        });
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };
  

  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // Regular expression to match only alphabetic characters and spaces
    const onlyLettersRegex = /^[a-zA-Z\s]*$/;
  
    // Check if the entered value contains only alphabetic characters and spaces
    if (name === "user_first_name" || name === "user_last_name") {
      if (!onlyLettersRegex.test(value)) {
        // If the input contains invalid characters, don't update the state
        return;
      }
    }
  
    setFormData({ ...formData, [name]: value });
  };
  

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      user_profile_photo: e.target.files[0],
    });
  };

  return (
    <div className="container mt-4" style={{ fontFamily: "serif, sans-serif", marginLeft:'20px' }}>
      <h2>
        <b>Registration Form</b>
      </h2>
      <br />
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "white",
          border: "1px solid lightgray",
          padding: "70px",
        }}
      >
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="user_first_name" className="form-label">
              <b>First Name</b>
            </label>
            <input
              type="text"
              className="form-control"
              id="user_first_name"
              name="user_first_name"
              onChange = {handleInputChange}
              value={formData.user_first_name}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="user_last_name" className="form-label">
              <b>Last Name</b>
            </label>
            <input
              type="text"
              className="form-control"
              id="user_last_name"
              name="user_last_name"
              onChange = {handleInputChange}
              value={formData.user_last_name}
              required
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="user_email" className="form-label">
              <b>Email</b>
            </label>
            <input
              type="text"
              className="form-control"
              id="user_email"
              name="user_email"
              onChange = {handleInputChange}
              value={formData.user_email}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="user_mobile_number" className="form-label">
              <b>Mobile Number</b>
            </label>
            <input
              type="tel"
              className="form-control"
              id="user_mobile_number"
              name="user_mobile_number"
              onChange={handleInputChange}
              onInput={(e) => {
                // Allow only numeric input
                e.target.value = e.target.value.replace(/\D/, '').slice(0, 10);
              }}
              value={formData.user_mobile_number}
              required
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="user_role" className="form-label">
              <b>User Role</b>
            </label>
            <select
              className="form-select"
              id="user_role"
              name="user_role"
              onChange = {handleInputChange}
              value={formData.user_role}
              required
            >
              <option value="">Select User Role</option>
              <option value="Doctor">Doctor</option>
              <option value="Pharmacist">Pharmacist</option>
              {/* Add more options as needed */}
            </select>
          </div>
          <div className="col-md-6">
            <label
              htmlFor="user_password"
              className="form-label"
              style={{ height: "1px" }}
            >
              <b>Password</b>
            </label>
            <div className="input-group mt-2">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="user_password"
                name="user_password"
                onChange = {handleInputChange}
                value={formData.user_password}
                required
              />
              <button
                className="btn h-0"
                type="button"
                onClick={handlePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 text-center">
            <button type="submit" className="btn btn-primary"
            style={{backgroundColor:'teal', color:'white'}}>
              Register
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;