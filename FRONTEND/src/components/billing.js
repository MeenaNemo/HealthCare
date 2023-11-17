import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios'; // Add this line to import axios

function Billing() {
  const [medicineRows, setMedicineRows] = useState(Array.from({ length: 5 }, (_, index) => ({ id: index + 1 })));
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscountTotal] = useState(0);
  const [grandtotal, setGrandTotal] = useState(0);
  const [submittedData, setSubmittedData] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const inputRefs = useRef([]);
  
  useEffect(() => {
    // Initialize inputRefs with refs for each input field
    setMedicineRows((prevRows) => {
      const newRows = prevRows.map((row) => ({
        ...row,
        refs: Array.from({ length: 5 }, (_, i) => inputRefs.current[row.id]?.[i] || null),
      }));
      return newRows;
    });
  }, []);
  

  const handleAddMedicine = () => {
    const newId = Date.now();
    setMedicineRows((prevRows) => [
      ...prevRows,
      { id: newId, refs: Array.from({ length: 5 }, (_, i) => null) },
    ]);

    // Shift focus to the first input field of the new row
    const nextInput = inputRefs.current[newId]?.[0];
    if (nextInput) {
      nextInput.focus();
    }
  };

  const handleKeyPress = async (event, rowIndex, colIndex, id) => {
    if (event.key === 'Enter' && event.target.tagName.toLowerCase() === 'input') {
      event.preventDefault();

      // Check if it's the DiscountTotal input field
      if (event.target.id ==='discount') {
        // Shift focus to the Patient Name input field
        const patientNameInput = document.getElementById('patientname');
        if (patientNameInput) {
          patientNameInput.focus();
          return;
        }
      }

      // Check if it's the Patient Name input field
      if (event.target.id === 'patientname') {
        // Shift focus to the Doctor Name input field
        const doctorNameInput = document.getElementById('doctorname');
        if (doctorNameInput) {
          doctorNameInput.focus();
          return;
        }
      }

      // Check if it's the Doctor Name input field
      if (event.target.id === 'doctorname') {
        // Shift focus to the Mobile Number input field
        const mobileNoInput = document.getElementById('mobileno');
        if (mobileNoInput) {
          mobileNoInput.focus();
          return;
        }
      }

      // Check if it's the Mobile Number input field
      if (event.target.id === 'mobileno') {
        // Shift focus to the Cash input field
        const cashInput = document.getElementById('cashgiven');
        if (cashInput) {
          cashInput.focus();
          return;
        }
      }

      // Check if it's the Cash input field
      if (event.target.id === 'cashgiven') {
        // Shift focus to the Balance input field
        const balanceInput = document.getElementById('balance');
        if (balanceInput) {
          balanceInput.focus();
          return;
        }
      }

      // Check if it's the last row and last column
      const isLastRow = rowIndex === medicineRows.length - 1;
      const isLastColumn = colIndex === 3;

      if (isLastRow && isLastColumn) {
        // Shift focus to the DiscountTotal input field
        const discountTotalInput = document.getElementById('discount');
        if (discountTotalInput) {
          discountTotalInput.focus();
          return;
        }
      }

      // Continue with the existing logic for navigating through medicine rows
      if (isLastColumn) {
        // Shift focus to the first input field of the next row
        const nextRowIndex = rowIndex + 1;
        const nextInput = inputRefs.current[medicineRows[nextRowIndex].id]?.[0];
        if (nextInput) {
          nextInput.focus();
        }
      } else {
        // Shift focus to the next input field in the same row
        const nextColIndex = colIndex + 1;
        const nextInput = inputRefs.current[id]?.[nextColIndex];
        if (nextInput) {
          nextInput.focus();
        }
      }

      // Calculate and update the total when qty and qtyPrice are entered
      if (colIndex === 0 || colIndex === 1 || colIndex === 2) {
        const qty = parseFloat(inputRefs.current[id]?.[1].value) || 0;
        const qtyprice = parseFloat(inputRefs.current[id]?.[2].value) || 0;
        const total = qty * qtyprice;
        const medicinename = inputRefs.current[id]?.[0].value || ''; // Assuming colIndex 0 is for medicine name

        try {
          const response = await axios.get(`http://localhost:3000/stock?medicinename=${medicinename}`);
          const expired = response.data.expired;
    
          if (expired) {
            alert(`The medicine ${medicinename} has expired!`);
            // Clear the medicine name field
            const medicineNameInput = inputRefs.current[id]?.[0];
            if (medicineNameInput) {
              medicineNameInput.value = '';
            }
          }
        } catch (error) {
          console.error('Error fetching expiry date:', error);
          // Handle API call error here
        }    

        axios.get(`http://localhost:3000/quantity?medicinename=${medicinename}`)
  .then((response) => {
    const availableQuantity = response.data.availableQuantity;
    console.log(availableQuantity)

    // Compare the entered quantity with the available quantity
    if (qty > availableQuantity) {
      alert(`Quantity not available. Available Quantity: ${availableQuantity}`);
      const qtyInput = inputRefs.current[id] && inputRefs.current[id][1];
      if (qtyInput) {
        qtyInput.value = '';
      }
    }
  })
  .catch((error) => {
    console.error('Error fetching available quantity:', error);
    // Handle API call error here
  });
        
 

        // Update the total for the current row using the functional form of setMedicineRows
        setMedicineRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, total } : row
          )
        );

        // Update the total input field
        const totalInput = inputRefs.current[id]?.[3];
        if (totalInput) {
          totalInput.value = total.toFixed(2); // Display total with two decimal places
        }
      }

    
      // Calculate subtotal and update using the latest state
      const newSubtotal = medicineRows.reduce((acc, row) => acc + (row.total || 0), 0);
      setSubtotal(newSubtotal);

      const newGrandTotal = newSubtotal - discount;
      setGrandTotal(newGrandTotal);
    }
  };

  const handleDiscountChange = (event) => {
    const newDiscountTotal = parseFloat(event.target.value) || 0;
    setDiscountTotal(newDiscountTotal);

    const newGrandTotal = subtotal - newDiscountTotal;
    setGrandTotal(newGrandTotal);
  };

  const handleRemoveMedicine = (id) => {
    setMedicineRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };
  
  const handlePrint = () => {
    // Logic to handle printing the submitted data
    // You can modify this based on the actual content structure you want to print
    const printableContent = (
      <div>
        <h2>Submitted Billing Information</h2>
        {/* Display submitted data here */}
        <p>Subtotal: {subtotal}</p>
        <p>Discount: {discount}</p>
        <p>Grand Total: {grandtotal}</p>
        {/* Add other submitted data to be printed */}
      </div>
    );

    // Create a new window for the printable invoice
    const newWindow = window.open('', '_blank');
    newWindow.document.write('<html><head><title>Print</title></head><body>');
    newWindow.document.write(printableContent);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
  };

  const handleSubmit = async () => {
    const updatedMedicineRows = medicineRows.map((row) => {
      const qty = parseFloat(inputRefs.current[row.id][1].value) || 0;
      const qtyprice = parseFloat(inputRefs.current[row.id][2].value) || 0;
      const total = qty * qtyprice;
  
      inputRefs.current[row.id][3].value = total.toFixed(2);
  
      return {
        id: row.id,
        medicinename: inputRefs.current[row.id][0].value || '',
        qty: qty.toString(), // Ensure qty is converted to string before storing in DB
        qtyprice: qtyprice.toString(), // Ensure qtyprice is converted to string before storing in DB
        total: total.toFixed(2),
      };
    });
  
    setSubmittedData(updatedMedicineRows);
  
    const newSubtotal = updatedMedicineRows.reduce((acc, row) => acc + parseFloat(row.total || 0), 0);
    setSubtotal(newSubtotal);
  
    const newGrandTotal = newSubtotal - discount;
    setGrandTotal(newGrandTotal);
  
    // Constructing the billingData object
    const billingData = {
      medicineRows: updatedMedicineRows,
      subtotal: newSubtotal,
      discount: discount,
      grandtotal: newGrandTotal,
      patientname: document.getElementById('patientname').value || '',
      doctorname: document.getElementById('doctorname').value || '',
      mobileno: document.getElementById('mobileno').value || '',
      cashgiven: document.getElementById('cashgiven').value || '',
      balance: document.getElementById('balance').value || '',
      // Extract an array of medicine names from updatedMedicineRows
      medicinename: updatedMedicineRows.map((row) => row.medicinename),
    };
  
    try {
      const response = await axios.post('http://localhost:3000/billing', billingData);
      console.log('Billing data submitted successfully!', response.data);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting billing data:', error);
    }
  };
  
  
   
  return (
    <div>
       {!isSubmitted ? (
      <div className="container  ">
        <div className=' d-flex justify-content-between align-items-center mb-3'>
          <h2 className="mb-0">Billing 
            <span>
              <button type="button" className="btn ms-3 mb-2" >+ </button>
            </span>
          </h2>
          <div className="text-end">
            <button type="button" className="btn me-2">Cancel</button>
            <button type="button" style={{ backgroundColor: 'teal', color: 'white' }} className="btn" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
        <div className="container mt-1">
          <div className='row'>
            <div className='col-4 ms-2'>Medicine Name</div>
            <div className='col-2 ms-1'> Quantity</div>
            <div className='col-2 ms-1'> price</div>
            <div className='col-2 ms-1'> Total</div>
          </div>

          {medicineRows.map(({ id, refs }, rowIndex) => (
            <div className="row mt-2" key={id}>
              <div className="col-4">
                <input
                  id={`medicinename${id}`}
                  type="text"
                  className="form-control"
                  placeholder='Enter Name'
                  ref={(el) => (inputRefs.current[id] ||= [])[0] = el}
                  onKeyPress={(e) => handleKeyPress(e, rowIndex, 0, id)}
                />
              </div>
              <div className="col-2 ms-1">
                <input
                  id={`qty${id}`}
                  type="text"
                  className="form-control"
                  placeholder='qty'
                  ref={(el) => (inputRefs.current[id] ||= [])[1] = el}
                  onKeyPress={(e) => handleKeyPress(e, rowIndex, 1, id)}
                />
              </div>
              <div className="col-2 ms-1">
                <input
                  id={`qtyprice${id}`}
                  type="text"
                  className="form-control "
                  ref={(el) => (inputRefs.current[id] ||= [])[2] = el}
                  onKeyPress={(e) => handleKeyPress(e, rowIndex, 2, id)}
                />
              </div>

              <div className="col-2 ms-1">
                <input
                  id={`total${id}`}
                  type="text"
                  className="form-control "
                  ref={(el) => (inputRefs.current[id] ||= [])[3] = el}  
                  onKeyPress={(e) => handleKeyPress(e, rowIndex, 3, id)}  
                />
              </div>

              <div className="col-1 ms-1">
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => handleRemoveMedicine(id)}
                ></button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="row mt-1">
          <div className="col-6">
            <button type="button" className="btn mt-1 ms-3" style={{ backgroundColor: 'teal', color: 'white' }} onClick={handleAddMedicine}>
              Add More Medicine
            </button>
          </div>
          <div className="col-6">
            <div className="row mt-1">
              <div className="col-12 text-center">
                <label className="me-3">Subtotal</label>
                <input id="subtotal" type="text" className="border-0 text-start" value={subtotal} readOnly />
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-12 text-center">
                <label className="me-3">Discount</label>
                <input
                  id="discount"
                  className="border-0 text-start p-1"
                  type="text"
                  value={discount}
                  onChange={handleDiscountChange}
                  onKeyPress={(e) => handleKeyPress(e, 0, 0, 'discount')}
                />
              </div>
            </div>
            <div className="row mt-1">
              <div className="col-12 text-center">
                
                <div className="p-1 d-inline-block text-start" style={{ backgroundColor: 'teal' }}>
                  <label className="me-2 text-white">Grandtotal</label>
                  <input
                    className="border-0 text-white text-start p-1"
                    style={{ backgroundColor: 'teal' }}
                    id="grandtotal"
                    type="text"
                    value={grandtotal}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className='container '>
        <div className='row ms-3 mt-3 '>
          <div className='col-4 '><label >Patient Name</label><input type='text' id='patientname' onKeyPress={(e) => handleKeyPress(e, 0, 0, 'patientname')} /></div>
          <div className='col-4'> <label>Doctor Name</label><input type='text' id='doctorname' onKeyPress={(e) => handleKeyPress(e, 0, 0, 'doctorname')} /></div>
          <div className='col-4'><label>Mobile No</label><input type='text' id='mobileno' onKeyPress={(e) => handleKeyPress(e, 0, 0, 'mobileno')} /></div>
        </div>
       
        <div className='row ms-3 mt-3 p-2'>
          <div className='col-4'></div>
          <div className='col-4'><label>Cash Given</label><input type='text' id='cashgiven' onKeyPress={(e) => handleKeyPress(e, 0, 0, 'cashgiven')} /></div>
          <div className='col-4'><label>Balance</label><input type='text' id='balance' onKeyPress={(e) => handleKeyPress(e, 0, 0, 'balance')} /></div>
        </div>
        </div>
        <div className="row mt-1 mb-2 p-3 border-top border-top-2">
          <div className="col-md-12 text-end">
            <button type="button" className="btn me-2">Cancel</button>
            <button type="button" style={{ backgroundColor: 'teal', color: 'white' }} className="btn" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      </div>
      ) : (

        <div className="container">
        <div style={{ textAlign: 'center' }}>
          <div className="d-flex align-items-center">
            {/* <img
              src={logoImage}
              alt="Profile"
              style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
            /> */}
            <h4 className="text-xl font-weight-bold mb-0"><b>ALAGAR CLINIC</b></h4>
          </div>
          {/* Billing information table */}
          <table border="1" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product Description</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
            {submittedData.map((data) => (
                <tr key={data.id}>
                  <td>{data.id}</td>
                  <td>{data.medicinename }</td>
                  <td>{data.qty }</td>
                  <td>{data.qtyprice }</td>
                  <td>{data.total}</td>
                </tr>
              ))}
            </tbody>
            {/* Add subtotal, discount, grand total rows if needed */}
            <tfoot>
              <tr>
                <td colSpan="4">Subtotal:</td>
                <td>{subtotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* Buttons for actions */}
        <div className="col-md-12 text-end">
          <button type="button" className="btn me-2">Cancel</button>
          <button
            type="button"
            style={{ backgroundColor: 'teal', color: 'white' }}
            className="btn"
            onClick={handlePrint} // Call handlePrint for printing
          >
            Print
          </button>
        </div>
      </div>
    )}
    </div>
  );
}

export default Billing;