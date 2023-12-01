import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import billbg from "../logo/template.jpeg";
import ReactToPrint from "react-to-print";

const FloatingAlert = ({ message, type }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById("floating-alert").style.display = "none";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const style={
    position: "fixed",
    top: "10px",
    right: "300px",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
    zIndex: "9999",
    display: "block",
    backgroundColor: type === "error" ?  "blue": "red" ,
    color: "white",
  }

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
    consultingDoctorName: "Dr.G.Vasudevan M.S.,(Ortho)",
    obervation: "",
    consultantCharge: "",
    clinicCharge: "",
    opNumber: 1,
  });

  const [submittedData, setSubmittedData] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

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
      // Validate for numbers
      if (/^\d+$/.test(value) || value === "") {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else if (
      name === "firstName" ||
      name === "lastName" ||
      name === "obervation"
    ) {
      // Validate for text
      if (/^[A-Za-z\s]+$/.test(value) || value === "") {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      // For other fields, allow any input
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
    const isChargeFieldFilled =
      !!formData.clinicCharge || !!formData.consultantCharge;

    if (isAnyFieldEmpty && !isChargeFieldFilled) {
      setShowAlert(true); // Show floating alert if any required field is empty
      setTimeout(() => {
        setShowAlert(false); // Hide alert after 3 seconds
      }, 2000);
      return;
    }

    const totalCharge =
      parseInt(formData.consultantCharge || 0, 10) +
      parseInt(formData.clinicCharge || 0, 10);
    setSubmittedData({ ...formData, totalCharge });
    setShowForm(false);
    setShowAlert(false);
    clearAlert();


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
    const selectedDate = new Date(e.target.value);
    const currentDate = new Date();
  
    // Check if the selected date is in the future
    if (selectedDate > currentDate) {
      setAlertMessage("Please enter a valid date of birth.");
      setAlertType("error");
      return;
    }
  
    const age = calculateAge(e.target.value);
    setFormData({
      ...formData,
      dob: e.target.value,
      age: age.toString(),
    });
  
    // Clear DOB alert on valid DOB entry
    clearAlert();
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
    const lastOPNumber = localStorage.getItem("opNumber");
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
      opNumber: lastOPNumber ? parseInt(lastOPNumber, 10) + 1 : 1,
    });
    setShowForm(true); // Set showForm to true to display the consultation form again
    setShowAlert(false); 
    clearAlert(); // Hide the alert when canceling
  };
  const clearAlert = () => {
    // Clear alert message and type
    setAlertMessage("");
    setAlertType("");
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
              className=""
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
                      placeholder="Please Enter a Number"
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
                <FloatingAlert message="Please fill in all required fields." />
              )}
               {alertMessage && (
          <FloatingAlert message={alertMessage} type={alertType} />
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
                Go to Previous page
              </button>
            </div>

            {(!!submittedData.clinicCharge || !!submittedData.consultantCharge) && (
  <div
    className="mt-10"
    style={{
      marginLeft: "100px",
      marginTop: "50px",
      width: "67%",
      border: "1px solid lightgray",
      backgroundImage: `url(${billbg})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% 100%",
      fontFamily: "serif",
    }}
  >
     
    <div
      style={{ 
        gap: "10px",
        width:'100%',
        marginLeft: "160px",
        marginTop: "200px",
        // marginBottom: "300px",
      }}
    >
     <h3 style={{ paddingBottom: "10px" }}>
        {" "}
        <b>Doctor Consultation Form</b>
      </h3>
      <div style={{
         display: "grid",
         marginLeft:'-30px',
         gridTemplateColumns: "repeat(2, 1fr)",
      }}>
        <p>
          <b style={{ width: "170px", display: "inline-block" }} >
            OP Number:
          </b>{" "}
          {submittedData.opNumber}
        </p>
        <br/>
        {submittedData.firstName && (
          <p>
            <b style={{ width: "170px", display: "inline-block" }}>
              Patient Name:
            </b>{" "}
            {submittedData.firstName}{" "}
            {submittedData.lastName && (
              <span>{submittedData.lastName}</span>
            )}
          </p>
        )}
        <br/>
        {submittedData.gender && (
          <p>
            <b style={{ width: "170px", display: "inline-block" }}>
              Gender:
            </b>{" "}
            {submittedData.gender}
          </p>
        )}
<br/>
                  {submittedData.age && (
                    <p >
                      <b style={{ width: "170px", display: "inline-block" }}>Age :</b> 
                      {submittedData.age}
                    </p>
                  )}
                  <br/>
                  {submittedData.dob && (
                    <p >
                      <b style={{ width: "170px", display: "inline-block" }}>Date of Birth :</b> {submittedData.dob}
                    </p>
                  )}
                  <br/>
                  {submittedData.consultingDoctorName && (
                    <p >
                      <b > Doctor Name :</b>
                      {submittedData.consultingDoctorName}
                    </p>
                  )}
                  <br/>
                  {submittedData.obervation && (
                    <p >
                      <b style={{ width: "170px", display: "inline-block" }}>Observation :</b> {submittedData.obervation}
                    </p>
                  )}
                  <br/>
                  {submittedData.consultantCharge && (
                    <p >
                      <b style={{ width: "170px", display: "inline-block" }}>Consultant Charge :</b> {submittedData.consultantCharge}
                    </p>
                  )}
                  <br/>
                  {submittedData.clinicCharge && (
                    <p >
                      <b style={{ width: "170px", display: "inline-block" }}>Clinic Charge :</b> {submittedData.clinicCharge}
                    </p>
                  )}
                  <br/>
                  {submittedData.totalCharge && (
                    <p >
                      <b style={{ width: "170px", display: "inline-block" }}>Total Charge :</b> {submittedData.totalCharge}
                    </p>
                  )}


      </div>

        <div style={{marginTop:'260px'}}>
          <p><b>Doctor Signature</b></p>
        </div>
    </div>
  </div>
)}

          </>
        )}
      </div>
    </div>
  );
};

export default ConsultationForm;
