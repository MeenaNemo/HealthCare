import React, { useState, useEffect  } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


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
      fontFamily: 'serif'
    }}>
      <div style={{ marginRight:'100px', marginBottom:'-200px', marginTop:'25px'}}>
      <h2> <b>Doctor Consultation Form</b></h2>
     
      {showForm && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', border:'1px solid lightgray' }}>
          <div style={{margin:'20px'}}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="firstName" className="form-label"><b>First Name</b></label>
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
            <label htmlFor="lastName" className="form-label"><b>Last Name</b></label>
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
            <label htmlFor="gender" className="form-label"><b>Gender</b></label>
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
            <label htmlFor="dob" className="form-label"><b>Date of Birth</b></label>
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
          <label htmlFor="consultingDoctorName" className="form-label"><b>Consulting Doctor Name</b></label>

    <input
      type="text"
      className="form-control"
      id="consultingDoctorName"
      name="consultingDoctorName" // Changed the name attribute
      // value={formData.consultingDoctorName}
      value='Dr. Doctor Name' // Set your default value here
      onChange={handleChange}
      required
    />
          </div>
          <div className="col-md-6">
          <label htmlFor="doctorName" className="form-label"><b>Disease Name</b></label>
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
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
          <label htmlFor="clinicCharge" className="form-label"><b>Clinic Charge</b></label>
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
          <div className="col-md-6">
            <label htmlFor="consultantCharge" className="form-label"><b>Consultant Charge</b></label>
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
        </div>
      
        <div className="row">
          <div className="col-md-12">
            <button type="submit" className="btn" style={{ backgroundColor: 'teal', width: '200px' }}>Submit</button>
          </div>
        </div>
        </div>
      </form>
 
      )}

{!showForm && submittedData && (
        <div className="mt-10" style={{marginLeft:'200px', marginTop:'50px', }}>
          <h3> <b>Submitted Form Data</b></h3>
          <br/>
          <div style={{marginLeft:'50px'}}>

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
        </div>
      )}



      </div>
     
    </div>
  );
};

export default ConsultationForm;
