import { React, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';


function AddMedicine() {
  const [formData, setFormData] = useState({
    medicinename: '',
    brandname: '',
    otherdetails: '',
    purchaseprice: '',
    totalqty: '',
    purchaseamount: 0,
    dosage:'',
    dosageUnit: '',
    expirydate: '',
    mrp: ''
  });

  const [showPopup, setShowPopup] = useState(false);
  
  const [dosageUnitPopupShown, setDosageUnitPopupShown] = useState(false);

 
    
  const handleChange = (event) => {
    const { id, value } = event.target;
  
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
 
  const handleDosageUnitChange = (event) => {
    const { value } = event.target;
  
    setFormData((prevData) => {
      const currentDosage = String(prevData.dosage);
      
      // Remove existing unit, if any, before adding the new unit
      const dosageWithoutUnit = currentDosage.replace(/[^\d]/g, '');
      const newDosage = dosageWithoutUnit + value;

      return {
        ...prevData,
        dosage: newDosage,
        dosageUnit: value,
      };
    });

    setDosageUnitPopupShown(true);
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
      dosageUnit:'mg',
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
  
        // Check if the error message already exists
        const errorMessageContainer = inputElement.parentNode.querySelector('.error-message-container');
        if (!errorMessageContainer) {
          // Create and append error message if it doesn't exist
          const errorMessage = document.createElement('p');
          errorMessage.className = 'error-message-container';
          errorMessage.textContent = `Please fill this field.`;
  
          // Set a fixed height for the error message container
          const errorMessageContainer = document.createElement('div');
          errorMessageContainer.style.height = '10px'; // Adjust the height as needed
          errorMessageContainer.appendChild(errorMessage);
  
          // Append the error message container to the parent of the input field
          inputElement.parentNode.appendChild(errorMessageContainer);
        }
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
      console.log("Form Submitted!");
  
      // Reset form data after successful submission
      setFormData({
        medicinename: '',
        brandname: '',
        otherdetails: '',
        purchaseprice: '',
        totalqty: '',
        purchaseamount: 0,
        dosage: '',
        dosageUnit:'',
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

    <div className="container"style={{ 
          fontFamily: 'serif' ,width: '100%', margin: '10px'
    }}>
      <div className="m-3">
      <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
  <h2 className="mb-0"><b>Add Medicine</b></h2>
</div>

      <form onSubmit={handleSubmit} style={{backgroundColor:'white', border:'1px solid lightgray'}}>
      <div className="m-4">
        <div className="row">
          <div className="col-md-12 col-12 col-sm-12">
            <div className="form-group  text-left rounded-3">
              <b><label htmlFor="medicinename">Medicine Name</label></b>
              <input type="text" className="form-control col-md-6 col-lg-4" id="medicinename" value={formData.medicinename} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
          </div>
        </div>
        
        <br />

        <div className="row">
        <div className="col-md-6 col-12">
  <div className="form-group  text-left rounded-3" >
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
          // Ensure that dosage is always a string with the dosage unit
          setFormData((prevData) => ({
            ...prevData,
            dosage: String(prevData.dosage).endsWith(formData.dosageUnit) ? prevData.dosage : prevData.dosage + prevData.dosageUnit,
          }));
        }}
   
        
        
      /><select
    // Adjust the width as needed
    className="form-select w-50"
      id="dosageUnit"
      value={formData.dosageUnit}
      onChange={(e) => {
        handleDosageUnitChange(e);
        // Manually trigger onBlur when the select box is changed
        const dosageInput = document.getElementById('dosage');
        if (dosageInput) {
          dosageInput.dispatchEvent(new Event('blur'));
        }
      }}
    >
      <option value="mg">mg</option>
      <option value="ml">ml</option>
      <option value="gm">gm</option>
    </select>
    
    </div>
  </div>
</div>

          <div className="col-md-6 col-12">
            <div className="form-group  text-left rounded-3">
              <b><label htmlFor="brandName">Brand Name</label></b>
              <input type="text" className="form-control" id="brandname" value={formData.brandname} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
            <br />
          </div>
        </div>


        <div className="row">
          <div className="col-md-12 col-12 col-sm-12">
            <div className="form-group  text-left rounded-3">
              <b><label htmlFor="medicineName">Other Details</label></b>
              <input type="text" className="form-control" id="otherdetails" value={formData.otherdetails} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
            <br />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 col-12 col-sm-4">
            <div className="form-group  text-left rounded-3">
              <b><label htmlFor="purchaseprice">Purchase Price</label></b>
              <input type="number" className="form-control" id="purchaseprice" value={formData.purchaseprice} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
          </div>

          <div className="col-md-4 col-12 col-sm-4">
            <div className="form-group  text-left rounded-3">
              <b><label htmlFor="totalqty">Total Qty</label></b>
              <input type="number" className="form-control" id="totalqty" value={formData.totalqty} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
          </div>

          <div className="col-md-4 col-12 col-sm-4">
            <div className="form-group  text-left rounded-3">
              <b><label htmlFor="purchaseamount">Purchase Amount</label></b>
              <input type="number" className="form-control" id="purchaseamount" value={formData.purchaseamount} readOnly onKeyDown={handleKeyDown} />
            </div>
            <br />
          </div>
        </div>

        <div className="row">

          <div className="col-md-4 col-12 col-sm-4">
            <div className="form-group  text-left rounded-3">
              <b><label htmlFor="expirydate">Expiry Date</label></b>
              <input type="date" className="form-control" id="expirydate" value={formData.expirydate} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="Select a date"
              />
            </div>
          </div>

          <div className="col-md-4 col-12 col-sm-4">
            <div className="form-group  text-left rounded-3">
              <b><label htmlFor="mrp">MRP</label></b>
              <input type="number" className="form-control" id="mrp" value={formData.mrp} onChange={handleChange} onKeyDown={handleKeyDown} />
            </div>
          </div>
        </div>
        <br />

        <div className="row">
          <div className="col-md-12 text-end">
          <button type="submit" className="btn btn-sm me-2" onClick={handleCancel}>
           Cancel
             </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleSubmit}>
                Submit
               </button>

          </div>
        </div>

        </div></form>
        <div
  className={`modal fade ${showPopup ? 'show' : ''}`}
  tabIndex="1"
  role="dialog"
  // style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
>
  <div className="modal-dialog modal-dialog-centered">
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