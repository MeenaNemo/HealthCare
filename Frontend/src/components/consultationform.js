import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import billbg from "../logo/ac.jpg";
import ReactToPrint from "react-to-print";

const FloatingAlert = ({ message }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Remove the notification after 3 seconds
      document.getElementById("floating-alert").style.display = "none";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      id="floating-alert"
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        backgroundColor: "red",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
        zIndex: "9999",
        display: "block",
      }}
    >
      {message}
    </div>
  );
};

const ConsultationForm = () => {
  const componentRef = useRef();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    dob: "",
    consultingDoctorName: "Dr.G.Vasudevan M.S.,(Ortho)",
    obervation: "",
    consultantCharge: "",
    clinicCharge: "",
    opNumber: 1,
  });

  const [submittedData, setSubmittedData] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Fetch the last OP Number from localStorage on component mount
    const lastOPNumber = localStorage.getItem("opNumber");
    if (lastOPNumber) {
      setFormData((prevData) => ({
        ...prevData,
        opNumber: parseInt(lastOPNumber, 10) + 1,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "clinicCharge" || name === "consultantCharge") {
      if (!isNaN(value) || value === "") {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "dob",
      "consultingDoctorName",
      "obervation",
      "consultantCharge",
      "clinicCharge",
    ];
    const isAnyFieldEmpty = requiredFields.some((field) => !formData[field]);

    if (isAnyFieldEmpty) {
      setShowAlert(true); // Show floating alert if any required field is empty
      return;
    }

    setSubmittedData(formData);
    setShowForm(false);

    localStorage.setItem("opNumber", formData.opNumber.toString());
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleDOBChange = (e) => {
    const age = calculateAge(e.target.value);
    setFormData({
      ...formData,
      dob: e.target.value,
      age: age.toString(),
    });
  };

  const generateOPNumber = () => {
    // Increment the opNumber in the state
    setFormData((prevData) => ({
      ...prevData,
      opNumber: prevData.opNumber + 1,
    }));
    return formData.opNumber + 1;
  };

  const handleCancel = (event) => {
    event.preventDefault();
    setFormData({
      firstName: "",
      lastName: "",
      age: "",
      gender: "",
      dob: "",
      consultingDoctorName: "Dr.G.Vasudevan M.S.,(Ortho)", // You might want to change this to consultingDoctorName to match the state
      observation: "", // Corrected the property name
      consultantCharge: "",
      clinicCharge: "",
      opNumber: 1,
    });
    setShowForm(true); // Set showForm to true to display the consultation form again
    setShowAlert(false); // Hide the alert when canceling
  };

  return (
    <div
      className="container"
      style={{
        fontFamily: "serif",
      }}
    >
      <div style={{ margin: "20px" }} ref={componentRef}>
        {showForm && (
          <>
            <h2>
              {" "}
              <b>Doctor Consultation Form</b>
            </h2>
            <form
              onSubmit={handleSubmit}
              style={{
                backgroundColor: "white",
                border: "1px solid lightgray",
              }}
            >
              <div style={{ margin: "20px" }}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">
                      <b>First Name</b>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">
                      <b>Last Name</b>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="gender" className="form-label">
                      <b>Gender</b>
                    </label>
                    <select
                      className="form-select"
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="dob" className="form-label">
                      <b>Date of Birth</b>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleDOBChange}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label
                      htmlFor="consultingDoctorName"
                      className="form-label"
                    >
                      <b>Consulting Doctor Name</b>
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      id="consultingDoctorName"
                      name="consultingDoctorName"
                      value={formData.consultingDoctorName}
                      onChange={handleChange}
                      readOnly // Set readOnly attribute to make it non-editable
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="doctorName" className="form-label">
                      <b>Observation</b>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="obervation"
                      name="obervation"
                      value={formData.obervation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="clinicCharge" className="form-label">
                      <b>Clinic Charge</b>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="clinicCharge"
                      name="clinicCharge"
                      value={formData.clinicCharge}
                      onChange={handleChange}
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                      }}
                      required
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="consultantCharge" className="form-label">
                      <b>Consultant Charge</b>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="consultantCharge"
                      name="consultantCharge"
                      value={formData.consultantCharge}
                      onChange={handleChange}
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                      }}
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="row mt-3 mb-4">
                  <div className="col-md-12 text-end">
                    <button
                      type="submit"
                      className="btn  me-2"
                      onClick={handleCancel}
                      style={{ backgroundColor: "teal", color: "white" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      style={{ backgroundColor: "teal", color: "white" }}
                      className="btn "
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
              {showAlert && (
                <FloatingAlert message="Please fill in all required fields before submitting." />
              )}
            </form>
          </>
        )}

        {!showForm && submittedData && (
          <>
            <div className="d-flex justify-content-end align-items-end">
              <ReactToPrint
                trigger={() => (
                  <button
                    type="button"
                    className="btn"
                    style={{ backgroundColor: "teal", color: "white" }}
                  >
                    Print
                  </button>
                )}
                content={() => componentRef.current}
              />
              <button
                type="button"
                className="btn me-2 ms-2"
                style={{ backgroundColor: "green", color: "white" }}
                onClick={handleCancel}
              >
                Go to Previouspage
              </button>
            </div>

            <div
              className="mt-10"
              style={{
                marginLeft: "100px",
                marginTop: "50px",
                width: "65%",
                height: "600px",
                border: "1px solid black",
                backgroundImage: `url(${billbg})`,
                backgroundSize: "cover",
                fontFamily: "serif",
              }}
            >
              <div style={{ marginLeft: "160px", marginTop: "180px" }}>
                <h3>
                  {" "}
                  <b>Doctor Consultation Form</b>
                </h3>
                <p>OP Number: {submittedData.opNumber}</p>
                <p>
                  Patient Name: {submittedData.firstName}{" "}
                  {submittedData.lastName || ""}
                </p>
                <p>Gender: {submittedData.gender}</p>
                <p>Age: {submittedData.age}</p>
                <p>Date of Birth: {submittedData.dob}</p>
                <p>
                  Consulting Doctor Name: {submittedData.consultingDoctorName}
                </p>
                <p>Obervation: {submittedData.obervation}</p>
                <p>Consultant Charge: {submittedData.consultantCharge}</p>
                <p>Clinic Charge: {submittedData.clinicCharge}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConsultationForm;
