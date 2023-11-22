import React, { useState, useEffect  } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import bgImage from '../logo/y.jpeg';


const ConsultationForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        dob: '',
        doctorName: '',
        consultantCharge: '',
        clinicCharge: '',
        opNumber: 1
      });
    
      const [submittedData, setSubmittedData] = useState(null);
      const [showForm, setShowForm] = useState(true);
    
      useEffect(() => {
        // Fetch the last OP Number from localStorage on component mount
        const lastOPNumber = localStorage.getItem('opNumber');
        if (lastOPNumber) {
          setFormData((prevData) => ({
            ...prevData,
            opNumber: parseInt(lastOPNumber, 10) + 1,
          }));
        }
      }, []);

      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        setSubmittedData(formData);
        setShowForm(false);
    
        // Store the latest OP Number in localStorage
        localStorage.setItem('opNumber', formData.opNumber.toString());
      };

      const handlePrint = () => {
        const printableData = `
        <div style="background-image: url('../Assets/t.jpg');  background-repeat:no-repeat; ">
      <div style="color: black;    margin-left: 180px; margin-top:50px ">
        <h1>Submitted Form Data</h1>
        <p>Full Name: ${submittedData.firstName} ${submittedData.lastName || ''}</p>
        <p>Age: ${submittedData.age}</p>
        <p>Gender: ${submittedData.gender}</p>
        <p>Date of Birth: ${submittedData.dob}</p>
        <p>Consulting Doctor Name: ${submittedData.doctorName}</p>
        <p>Consultant Charge: ${submittedData.consultantCharge}</p>
        <p>Clinic Charge: ${submittedData.clinicCharge}</p>
        <p>OP Number: ${submittedData.opNumber}</p>
      </div>
    </div>
        `;
    
        // Open a new window and populate it with the printable data
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Printable Form Data</title>
            </head>
            <style>
          body {
            margin: 0;
            font-family: Serif;
          }
        </style>
            <body>
              <pre>${printableData}</pre>
              <script>
                // Automatically trigger print dialog once the window loads
                window.onload = function() {
                  window.print();
                }
              </script>
            </body>
          </html>
        `);
      };
    
      const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
    
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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

  return (
    <div className="container" style={{ 

      backgroundImage: `url(${bgImage})`, 
      backgroundSize: '100%',
      marginLeft:'-50px',
      fontFamily: 'serif'
    }}>
      <div style={{marginLeft:'100px', marginRight:'100px', marginBottom:'-200px'}}>
      <h2> <b>Doctor Consultation Form</b></h2>
     
      {showForm && (
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label">First Name</label>
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
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="gender" className="form-label">Gender</label>
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
          <div className="mb-3">
            <label htmlFor="dob" className="form-label">Date of Birth</label>
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
          <div className="mb-3">
            <label htmlFor="doctorName" className="form-label">Consulting Doctor Name</label>
            <input
              type="text"
              className="form-control"
              id="doctorName"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="consultantCharge" className="form-label">Consultant Charge</label>
            <input
              type="number"
              className="form-control"
              id="consultantCharge"
              name="consultantCharge"
              value={formData.consultantCharge}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="clinicCharge" className="form-label">Clinic Charge</label>
            <input
              type="number"
              className="form-control"
              id="clinicCharge"
              name="clinicCharge"
              value={formData.clinicCharge}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn" style={{backgroundColor:'teal', marginLeft:'300px', width:'200px'}}>Submit</button>
        </form>
      )}

{!showForm && submittedData && (
        <div className="mt-10">
          {/* <img src='../Assets/e.jpeg'/> */}
          <h3>Submitted Form Data:</h3>
          <p>Full Name: {submittedData.firstName} {submittedData.lastName || ''}</p>
          <p>Age: {submittedData.age}</p>
          <p>Gender: {submittedData.gender}</p>
          <p>Date of Birth: {submittedData.dob}</p>
          <p>Consulting Doctor Name: {submittedData.doctorName}</p>
          <p>Consultant Charge: {submittedData.consultantCharge}</p>
          <p>Clinic Charge: {submittedData.clinicCharge}</p>
          <p>OP Number: {submittedData.opNumber}</p>
          <button onClick={handlePrint} className="btn btn-secondary">Print</button>
        </div>
      )}



      </div>
     
    </div>
  );
};

export default ConsultationForm;
