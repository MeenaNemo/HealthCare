import {React, useState} from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

    function AddMedicineForm() {
        const [formData, setFormData] = useState({
            medicinename: '',
            brandname: '',
            otherdetails: '',  
            buyingprice: '',
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
          
            // Check if the value is a valid number or date
            const numericValue = parseFloat(value);
          
            setFormData((prevData) => {
              let updatedData = {
                ...prevData,
                [id]: isNaN(numericValue) ? value : numericValue,
              };
          
              // Exclude expiry date from the multiplication
              if (id === 'buyingprice' && !isNaN(numericValue) && !isNaN(prevData.buyingprice)) {
                updatedData.purchaseamount = numericValue * prevData.totalqty;
              } else if (id === 'totalqty' && !isNaN(numericValue) && !isNaN(prevData.totalqty)) {
                updatedData.purchaseamount = prevData.buyingprice * numericValue;
              }
          
              // Format the expiryDate if it's a date
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
             
              buyingprice: '',
              totalqty: '',
              purchaseamount: 0, // Reset total price
              dosage: '',
              expirydate: '',
              mrp: ''
            });
          };

          const handleSubmit = async (event) => {
            event.preventDefault();
          
            try {
              await axios.post('http://localhost:3000/purchase', formData);
              setShowPopup(true);
          
              // Reset the form after showing the popup
              setFormData({
                medicinename: '',
                brandname: '',
                otherdetails: '',
                buyingprice: '',
                totalqty: '',
                purchaseamount: 0, // Reset total price
                dosage: '',
                expirydate: '',
                mrp: ''
              });
            } catch (error) {
              console.error('Error submitting data: ' + error);
            }
          };
          
  const closePopup = (event) => {
   
    setShowPopup(false);
    // Reset the form after closing the popup
  };
  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      const currentInputId = event.target.id;
      const inputOrder = [
        'medicinename',
        'brandname',
        'otherdetails',
        'buyingprice',
        'totalqty',
        'dosage',
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
    
    <div className="container ">
        <div className=' d-flex justify-content-between align-items-center mb-3'>
          <h2 className="mb-0">Add Medicine
            <span>
              <button type="submit" className="btn ms-3 mb-2" onClick={handleCancel}>+</button>
            </span>
          </h2>
          <div className="text-end">
            <button type="submit" className="btn me-2" onClick={handleCancel}>Cancel</button>
            <button type="button"  style={{ backgroundColor: 'teal', color: 'white' }} className="btn "   onClick={handleSubmit}>Submit</button>
          </div>
        </div>
<form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-12">
            <div className="form-group" style={labelStyle}>
              <label htmlFor="medicinename">Medicine Name</label>
              <input type="text" className="form-control" id="medicinename" value={formData.medicinename} onChange={handleChange}   onKeyDown={handleKeyDown} />
            </div>
          </div>
</div>
<br/>
<div className="row">
<div className="col-md-12">
            <div className="form-group" style={labelStyle}>
              <label htmlFor="brandName">Brand Name</label>
              <input type="text" className="form-control" id="brandname" value={formData.brandname} onChange={handleChange}   onKeyDown={handleKeyDown} />
            </div>
            <br />
          </div>
          </div>
          <div className="row">
          <div className="col-md-12">
            <div className="form-group" style={labelStyle}>
              <label htmlFor="medicineName">Other Details</label>
              <input type="text" className="form-control" id="otherdetails" value={formData.otherdetails} onChange={handleChange}  onKeyDown={handleKeyDown} />
            </div>
          </div>
</div>
<br/>

<div className="row">
          <div className="col-md-4">
            <div className="form-group" style={labelStyle}>
              <label htmlFor="buyingprice">Buying Price</label>
              <input type="text" className="form-control" id="buyingprice" value={formData.buyingprice} onChange={handleChange}  onKeyDown={handleKeyDown} />
            </div>
          </div>

          <div className="col-md-4">
            <div className="form-group" style={labelStyle}>
              <label htmlFor="totalqty">Total Qty</label>
              <input type="text" className="form-control" id="totalqty" value={formData.totalqty} onChange={handleChange}  onKeyDown={handleKeyDown}  />
            </div>
          </div>

          <div className="col-md-4">
            <div className="form-group" style={labelStyle}>
              <label htmlFor="purchaseamount">Purchase Amount</label>
              <input type="text" className="form-control" id="purchaseamount" value={formData.purchaseamount} readOnly  onKeyDown={handleKeyDown} />
            </div>
          </div>
        </div>
        <br/>

        <div className="row">
          <div className="col-md-4">
          <div className="form-group" style={labelStyle}>
              <label htmlFor="dosage">Dosage</label>
              <input type="text" className="form-control" id="dosage" value={formData.dosage} onChange={handleChange}  onKeyDown={handleKeyDown} />
          </div>
          </div>

          <div className="col-md-4">
  <div className="form-group" style={labelStyle}>
    <label htmlFor="expirydate">Expiry Date</label>
    <input type="date" className="form-control" id="expirydate" value={formData.expirydate} onChange={handleChange}  onKeyDown={handleKeyDown} placeholder="Select a date"
    />
  </div>
</div>

          <div className="col-md-4">
            <div className="form-group" style={labelStyle}>
              <label htmlFor="mrp">MRP</label>
              <input type="text" className="form-control" id="mrp" value={formData.mrp} onChange={handleChange}  onKeyDown={handleKeyDown} />
            </div>
          </div>
        </div>
        <br/>

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
              <button type="button" className="btn-close"  onClick={ closePopup}></button>
            </div>
            <div className="modal-body">
              <p>Medicine has been added successfully.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary"  onClick={ closePopup}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default AddMedicineForm;