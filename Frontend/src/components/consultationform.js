import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import billbg from "../logo/newtemplate.jpg";
import ReactToPrint from "react-to-print";

const FloatingAlert = ({ message, type }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById("floating-alert").style.display = "none";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const style = {
    position: "fixed",
    top: "10px",
    right: "300px",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
    zIndex: "9999",
    display: "block",
    backgroundColor: type === "error" ? "blue" : "red",
    color: "white",
  };

  return (
    <div id="floating-alert" style={style}>
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
    consultingDoctorName: "Dr. Jothipriya.A MBBS",
    observation: "",
    consultantCharge: "",
    clinicCharge: "",
  });
  const [highlightedFields, setHighlightedFields] = useState([]);
  const [submittedData, setSubmittedData] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "clinicCharge" || name === "consultantCharge") {
      if (/^\d+$/.test(value) || value === "") {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else if (name === "dob") {
      // Handle Age input
      if (/^\d{0,3}$/.test(value) || value === "") {
        // Allow only up to two digits for age
        const age = value;
        setFormData({
          ...formData,
          dob: age, // Storing age in the "dob" field
          age: age,
        });
      }
    } else if (
      name === "firstName" ||
      name === "lastName" ||
      name === "observation"
    ) {
      if (/^[A-Za-z\s]+$/.test(value) || value === "") {
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
    setHighlightedFields(highlightedFields.filter((field) => field !== name));
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
      "observation",
    ];
  
    const emptyFields = requiredFields.filter((field) => !formData[field]);
    if (emptyFields.length > 0) {
      // Highlight empty fields
      setHighlightedFields(emptyFields);
      return;
    }
  
    // Check if at least one of the charges is filled
    if (!formData.consultantCharge && !formData.clinicCharge) {
      // Highlight charges if both are empty
      setHighlightedFields(["consultantCharge", "clinicCharge"]);
      return;
    }
  
    const totalCharge =
      parseInt(formData.consultantCharge || 0, 10) +
      parseInt(formData.clinicCharge || 0, 10);
    setSubmittedData({ ...formData, totalCharge });
    setShowForm(false);
    setShowAlert(false);
    clearAlert();
  };
  

  const handleCancel = (event) => {
    event.preventDefault();
    setFormData({
      firstName: "",
      lastName: "",
      age: "",
      gender: "",
      dob: "",
      consultingDoctorName: "Dr. Jothipriya.A MBBS",
      observation: "",
      consultantCharge: "",
      clinicCharge: "",
    });
    setShowForm(true);
    setShowAlert(false);
    clearAlert();
  };

  const clearAlert = () => {
    setAlertMessage("");
    setAlertType("");
  };

  const tstyle = {
    fontSize: "20px",
  };

  return (
    <div
      className="container"
      style={{
        fontFamily: "serif",
      }}
    >
      <style>
        {`
      @media print  {
        body {
          margin: 10px;
        }  
      .highlight-input {
        border: 1px solid red;
      }
    }
    `}
      </style>
      <div style={{ marginTop: "20px" }}>
        {showForm && (
          <>
            <h2>
              <b>Doctor Consultation Form</b>
            </h2>

            <div className="row">
              <div className=" d-flex justify-content-end">
                <div className="d-flex align-items-center">
                  <label htmlFor="currentDate" className="form-label mb-0 me-2">
                    <b>Date</b>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="currentDate"
                    name="currentDate"
                    value={new Date().toLocaleDateString()}
                    readOnly
                    style={{ width: "100px" }}
                  />{" "}
                </div>
              </div>

              <div>
                <form
                  onSubmit={handleSubmit}
                  className="mt-2"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid lightgray",
                  }}
                >
                  <div style={{ margin: "20px" }}>
                    <div className="row mb-4">
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
                          style={{
                            border: highlightedFields.includes('firstName') ? '1px solid red' : '1px solid #ccc',
                          }}
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
                          style={{
                            border: highlightedFields.includes('lastName') ? '1px solid red' : '1px solid #ccc',
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="row mb-4">
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
                          style={{
                            border: highlightedFields.includes('gender') ? '1px solid red' : '1px solid #ccc',
                          }}
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
                          <b>Age</b>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="dob"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          style={{
                            border: highlightedFields.includes('dob') ? '1px solid red' : '1px solid #ccc',
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="row mb-4">
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
                          readOnly
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
                          id="observation"
                          name="observation"
                          value={formData.observation}
                          onChange={handleChange}
                          style={{
                            border: highlightedFields.includes('observation') ? '1px solid red' : '1px solid #ccc',
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label htmlFor="clinicCharge" className="form-label">
                          <b>Clinic Charge</b>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="clinicCharge"
                          placeholder="Please Enter a Number"
                          name="clinicCharge"
                          value={formData.clinicCharge}
                          onChange={handleChange}
                          style={{
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                            border: highlightedFields.includes('clinicCharge') ? '1px solid red' : '1px solid #ccc',
                          }}
                          required
                          min="0"
                        />
                      </div>
                      <div className="col-md-6">
                        <label
                          htmlFor="consultantCharge"
                          className="form-label"
                        >
                          <b>Consultant Charge</b>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="consultantCharge"
                          name="consultantCharge"
                          placeholder="Please Enter a Number"
                          value={formData.consultantCharge}
                          onChange={handleChange}
                          style={{
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                            border: highlightedFields.includes('consultantCharge') ? '1px solid red' : '1px solid #ccc',

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
                    <FloatingAlert message="Please fill all input fields." />
                  )}
                  {alertMessage && (
                    <FloatingAlert message={alertMessage} type={alertType} />
                  )}
                </form>
              </div>
            </div>
          </>
        )}
        <div className="overflow-auto">
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
                  Go to Previous page
                </button>
              </div>
              {(!!submittedData.clinicCharge ||
                !!submittedData.consultantCharge) && (
                <div
                  ref={componentRef}
                  style={{
                    border: "1px solid grey",
                    backgroundImage: `url(${billbg})`,
                    backgroundSize: "205mm 290mm",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    height: "290mm",
                    width: "205mm",
                    position: "relative",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      gap: "10px",
                      width: "80%",
                      marginLeft: "90px",
                      marginTop: "270px",
                    }}
                  >
                    <h3 style={{ paddingBottom: "10px", textAlign: "center" }}>
                      {" "}
                      <b>Doctor Consultation Form</b>
                    </h3>
                    <table style={{ width: "100%" }}>
                      <tbody>
                        <tr>
                          <td style={tstyle}>
                            <b> Date</b>
                          </td>
                          <td style={tstyle}>
                            {new Date().toLocaleDateString()}
                          </td>
                        </tr>

                        <tr>
                          <td style={tstyle}>
                            <b>Patient Name</b>
                          </td>
                          <td style={tstyle}>
                            {submittedData.firstName}{" "}
                            {submittedData.lastName && (
                              <span>{submittedData.lastName}</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td style={tstyle}>
                            <b>Gender</b>
                          </td>
                          <td style={tstyle}>{submittedData.gender}</td>
                        </tr>
                        <tr>
                          <td style={tstyle}>
                            <b>Age</b>
                          </td>
                          <td style={tstyle}>{submittedData.age}</td>
                        </tr>
                       
                        <tr>
                          <td style={tstyle}>
                            <b>Doctor Name</b>
                          </td>
                          <td style={tstyle}>
                            {submittedData.consultingDoctorName}
                          </td>
                        </tr>
                        <tr>
                          <td style={tstyle}>
                            <b>Observation</b>
                          </td>
                          <td style={tstyle}>{submittedData.observation}</td>
                        </tr>
                        <tr>
                          <td style={tstyle}>
                            <b>Consultant Charge</b>
                          </td>
                          <td style={tstyle}>
                            {submittedData.consultantCharge}
                          </td>
                        </tr>
                        <tr>
                          <td style={tstyle}>
                            <b>Clinic Charge</b>
                          </td>
                          <td style={tstyle}>{submittedData.clinicCharge}</td>
                        </tr>
                        <tr>
                          <td style={tstyle}>
                            <b>Total Charge</b>
                          </td>
                          <td style={tstyle}>{submittedData.totalCharge}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div
                    className="text-start"
                    style={{ margin: "100px", fontSize: "20px" }}
                  >
                    <p style={{paddingTop:'15px'}}>
                      <b>Doctor Signature</b>
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationForm;
