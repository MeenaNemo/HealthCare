import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const RegistrationForm = () => {
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
    try {
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
        // Handle successful registration, maybe redirect or show a success message
      }
    } catch (error) {
      console.error("Registration failed:", error);
      // Handle registration failure, show error message
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      user_profile_photo: e.target.files[0],
    });
  };

  return (
    <div className="container mt-4" style={{ fontFamily: "serif" }}>
      <h2 className="text-center">
        <b>Registration Form</b>
      </h2>
      <br />
      <form
        onSubmit={handleSubmit}
        style={{
          margin: "7px",
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
              value={formData.user_first_name}
              onChange={handleInputChange}
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
              value={formData.user_last_name}
              onChange={handleInputChange}
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
              value={formData.user_email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="user_mobile_number" className="form-label">
              <b>Mobile Number</b>
            </label>
            <input
              type="text"
              className="form-control"
              id="user_mobile_number"
              name="user_mobile_number"
              value={formData.user_mobile_number}
              onChange={handleInputChange}
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
              value={formData.user_role}
              onChange={handleInputChange}
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
              style={{ height: "3px" }}
            >
              <b>Password</b>
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="user_password"
                name="user_password"
                value={formData.user_password}
                onChange={handleInputChange}
                required
              />
              <button
                className="btn h-2"
                type="button"
                onClick={handlePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>
        </div>

        {/* <div className="row mb-3">
          <div className="col-md-12">
            <label htmlFor="user_profile_photo" className="form-label">Profile Photo</label>
            <input
          type="file"
          name="user_profile_photo"
          onChange={handleFileChange}
        />
          </div>
        </div> */}

        <div className="row">
          <div className="col-md-12 text-center">
            <button type="submit" className="btn btn-primary">
              Register
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
