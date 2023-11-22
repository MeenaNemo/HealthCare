import { React, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import bgImage from '../logo/y.jpeg';



function AddMedicine() {
  const [formData, setFormData] = useState({
    medicinename: '',
    brandname: '',
    otherdetails: '',
    purchaseprice: '',
    totalqty: '',
    purchaseamount: 0,
    dosage: '',
    expirydate: '',
    mrp: ''
  });

  const [showPopup, setShowPopup] = useState(false);

  const labelStyle = {
    textAlign: 'left',
  };


  const handleChange = (event) => {
    const { id, value } = event.target;
  
    // Add a regular expression to check for special characters
    const specialCharacterRegex = /^[a-zA-Z0-9\s]*$/;
  
    const numericValue = parseFloat(value);
  
    // Reset border color and hide error messages
    const inputElement = document.getElementById(id);
    if (inputElement) {
      inputElement.style.border = '';
      const errorMessageContainer = inputElement.parentNode.querySelector('.error-message-container');
      if (errorMessageContainer) {
        errorMessageContainer.remove();
      }
    }
  
    setFormData((prevData) => {
      let updatedData = {
        ...prevData,
        [id]: id === 'medicinename' || id === 'brandname' ? (isNaN(numericValue) ? value : numericValue) : prevData[id],
      };
  
      if (id === 'purchaseprice' || id === 'totalqty') {
        const numericValue = parseInt(value, 10); // Parse the value as an integer
        if (!isNaN(numericValue)) {
          updatedData[id] = numericValue;
          updatedData.purchaseamount = id === 'purchaseprice' && !isNaN(prevData.totalqty)
            ? numericValue * prevData.totalqty
            : id === 'totalqty' && !isNaN(prevData.purchaseprice)
            ? prevData.purchaseprice * numericValue
            : 0; // Set default if one of the conditions fails
        }
      } else if (id === 'mrp') {
        const numericValue = parseFloat(value); // Parse the value as a float
        if (!isNaN(numericValue)) {
          updatedData.mrp = numericValue;
        }
      } else if (id === 'otherdetails') {
        updatedData.otherdetails = value; // Assign the value directly for otherdetails
      }
  
      if (id === 'expirydate' && !isNaN(new Date(value).getTime())) {
        updatedData.expirydate = new Date(value).toISOString().split('T')[0];
      }
  
      return updatedData;
    });
  };
  
  


  const handleCancel = (event) => {
    event.preventDefault();
    setFormData({
      medicinename: '',
      brandname: '',
      otherdetails: '',

      purchaseprice: '',
      totalqty: '',
      purchaseamount: 0,
      dosage: '',
      expirydate: '',
      mrp: ''
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Check for empty fields
    const emptyFields = Object.entries(formData).filter(([key, value]) => {
      // Check if the value is a string and it's empty after trimming
      return typeof value === 'string' && !value.trim();
    });
  
    if (emptyFields.length > 0) {
      // Highlight empty fields with red border and show error messages
      emptyFields.forEach(([key, value]) => {
        const inputElement = document.getElementById(key);
        inputElement.style.border = '1px solid red';
  
        // Create and append error message
        const errorMessage = document.createElement('p');
        errorMessage.className = 'error-message-container';
        errorMessage.textContent = `Please fill this field.`;
  
        // Set a fixed height for the error message container
        const errorMessageContainer = document.createElement('div');
        errorMessageContainer.style.height = '10px'; // Adjust the height as needed
        errorMessageContainer.appendChild(errorMessage);
  
        // Append the error message container to the parent of the input field
        inputElement.parentNode.appendChild(errorMessageContainer);
      });
      return;
    }
  
    try {
      // Reset border styles and remove error messages
      Object.keys(formData).forEach((key) => {
        const inputElement = document.getElementById(key);
        inputElement.style.border = '';
  
        // Remove error message if exists
        const errorMessageContainer = inputElement.parentNode.querySelector('.error-message-container');
        if (errorMessageContainer) {
          errorMessageContainer.remove();
        }
      });
  
      // Proceed with submitting data to the database
      await axios.post('http://localhost:3000/purchase', formData);
      setShowPopup(true);
  
      // Reset form data after successful submission
      setFormData({
        medicinename: '',
        brandname: '',
        otherdetails: '',
        purchaseprice: '',
        totalqty: '',
        purchaseamount: 0,
        dosage: '',
        expirydate: '',
        mrp: '',
      });
    } catch (error) {
      console.error('Error submitting data: ' + error);
    }
  };
  
  

  const closePopup = (event) => {

    setShowPopup(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const currentInputId = event.target.id;
      const inputOrder = [
        'medicinename',
        'dosage',
        'brandname',
        'otherdetails',
        'purchaseprice',
        'totalqty',
        'expirydate',
        'mrp'
      ];

      const currentIndex = inputOrder.indexOf(currentInputId);

      if (currentIndex !== -1 && currentIndex < inputOrder.length - 1) {
        const nextInputId = inputOrder[currentIndex + 1];
        document.getElementById(nextInputId).focus();
      }
    }
  };

  return (

    <div className="container "style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundImage: `url(${bgImage})`, // Set your background image
      backgroundSize: '100%',
      marginLeft:'-50px',
      fontFamily: 'serif'
    }}>
      <div style={{margin:'10px'}}>
      <div className=' d-flex justify-content-between align-items-center mb-3 mt-4' style={{margin:'0px'}}>
        <h2 className="mb-0"> <b>Add Medicine</b>
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-12">
            <div className="form-group" style={labelStyle}>
              <b><label htmlFor="medicinename">Medicine Name</label></b>
              <input type="text" className="form-control" id="medicinename" value={formData.medicinename} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
          </div>
        </div>
        <br />

        <div className="row">
        <div className="col-md-6">
  <div className="form-group" style={labelStyle}>
    <b><label htmlFor="dosage">Dosage</label></b>
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        id="dosage"
        value={formData.dosage}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onInput={(e) => {
          const numericValue = e.target.value.replace(/[^0-9]/g, '');
          setFormData((prevData) => ({
            ...prevData,
            dosage: numericValue,
          }));
        }}
        onBlur={(e) => {
          // Ensure that dosage is always a string
          setFormData((prevData) => ({
            ...prevData,
            dosage: String(prevData.dosage).endsWith('mg') ? prevData.dosage : prevData.dosage + 'mg',
          }));
        }}
      />
    </div>
  </div>
</div>

          <div className="col-md-6">
            <div className="form-group" style={labelStyle}>
              <b><label htmlFor="brandName">Brand Name</label></b>
              <input type="text" className="form-control" id="brandname" value={formData.brandname} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
            <br />
          </div>
        </div>


        <div className="row">
          <div className="col-md-12">
            <div className="form-group" style={labelStyle}>
              <b><label htmlFor="medicineName">Other Details</label></b>
              <input type="text" className="form-control" id="otherdetails" value={formData.otherdetails} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
            <br />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <div className="form-group" style={labelStyle}>
              <b><label htmlFor="purchaseprice">Purchase Price</label></b>
              <input type="number" className="form-control" id="purchaseprice" value={formData.purchaseprice} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
          </div>

          <div className="col-md-4">
            <div className="form-group" style={labelStyle}>
              <b><label htmlFor="totalqty">Total Qty</label></b>
              <input type="number" className="form-control" id="totalqty" value={formData.totalqty} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
          </div>

          <div className="col-md-4">
            <div className="form-group" style={labelStyle}>
              <b><label htmlFor="purchaseamount">Purchase Amount</label></b>
              <input type="number" className="form-control" id="purchaseamount" value={formData.purchaseamount} readOnly onKeyDown={handleKeyDown} />
            </div>
            <br />
          </div>
        </div>

        <div className="row">

          <div className="col-md-4">
            <div className="form-group" style={labelStyle}>
              <b><label htmlFor="expirydate">Expiry Date</label></b>
              <input type="date" className="form-control" id="expirydate" value={formData.expirydate} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="Select a date"
              />
            </div>
          </div>

          <div className="col-md-4">
            <div className="form-group" style={labelStyle}>
              <b><label htmlFor="mrp">MRP</label></b>
              <input type="number" className="form-control" id="mrp" value={formData.mrp} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
          </div>
        </div>
        <br />

        <div className="row mt-3 mb-4">
          <div className="col-md-12 text-end">
            <button type="submit" className="btn  me-2" onClick={handleCancel}>Cancel</button>
            <button type="button" style={{ backgroundColor: 'teal', color: 'white' }} className="btn " onClick={handleSubmit} >Submit</button>
          </div>
        </div>

      </form>
      <div
        className={`modal fade ${showPopup ? 'show' : ''}`}
        style={{ display: showPopup ? 'block' : 'none' }}
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Medicine Added</h5>
              <button type="button" className="btn-close" onClick={closePopup}></button>
            </div>
            <div className="modal-body">
              <p>Medicine added successfully.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={closePopup}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default AddMedicine;
