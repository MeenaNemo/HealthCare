import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import bgImage from '../logo/y.jpeg';
import ReactToPrint from 'react-to-print';


function Billing() {
  const [medicineRows, setMedicineRows] = useState(Array.from({ length: 3 }, (_, index) => ({ id: index + 1 })));
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscountTotal] = useState(0);
  const [grandtotal, setGrandTotal] = useState(0);
  const [submittedData, setSubmittedData] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const inputRefs = useRef([]);
  const [loader, setLoader] = useState(false);
  const [cashGiven, setCashGiven] = useState('');
  const [balance, setBalance] = useState(0);
  const [mobileNo, setMobileNo] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [suggestions, setSuggestions] = useState('');
  const componentRef = useRef();


  useEffect(() => {
    setMedicineRows((prevRows) => {
      const newRows = prevRows.map((row) => ({
        ...row,
        refs: Array.from({ length: 4 }, (_, i) => inputRefs.current[row.id]?.[i] || null),
      }));
      return newRows;
    });
  }, []);

  const handleAddMedicine = () => {
    const newId = Date.now();
    setMedicineRows((prevRows) => [
      ...prevRows,
      { id: newId, refs: Array.from({ length: 4 }, (_, i) => null) },
    ]);

    const nextInput = inputRefs.current[newId]?.[0];
    if (nextInput) {
      nextInput.focus();
    }
  };

  const handleMedicineNameChange = async (event, id) => {
    const inputValue = event.target.value;
    try {
      const response = await axios.get(`http://localhost:3000/suggestions?partialName=${inputValue}`);
      const fetchedSuggestions = response.data.suggestions;
      setSuggestions(fetchedSuggestions);

      // Handle selection logic for dosage and other details
      // ...
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleKeyPress = async (event, rowIndex, colIndex, id) => {
    
  if (event.target.id === 'cashgiven' || event.target.id === 'discount') {
    // Allow typing in the cash given input field
    
    return;
   
  }
    const isValidKey = /^[a-zA-Z0-9\s]*$/.test(event.key);
    const isWithinLength = mobileNo.length < 10;

    if (!isValidKey || !isWithinLength) {
      event.preventDefault();
    }

    if ((event.key === 'Enter' || event.key === 'Tab') && event.target.tagName.toLowerCase() === 'input') {
      event.preventDefault();
      if (event.key === 'Tab' && event.target.tagName.toLowerCase() === 'input') {
        // Shift focus to the next input field in the same row or the first input field of the next row
        const nextRowIndex = rowIndex + (event.shiftKey ? -1 : 1);
        const nextColIndex = colIndex + (event.shiftKey ? -1 : 1);
  
        if (nextColIndex >= 0 && nextColIndex <= 3) {
          // Shift focus to the next input field in the same row
          const nextInput = inputRefs.current[id]?.[nextColIndex];
          if (nextInput) {
            nextInput.focus();
          }
        } else if (nextRowIndex >= 0 && nextRowIndex < medicineRows.length) {
          // Shift focus to the first input field of the next row
          const nextInput = inputRefs.current[medicineRows[nextRowIndex].id]?.[0];
          if (nextInput) {
            nextInput.focus();
          }
        }
      }

      // Check if it's the DiscountTotal input field
      if (event.target.id === 'discount') {
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
        const tabletname = inputRefs.current[id]?.[0].value || '';
        const dosage = tabletname.split(' ')[1] || '';
        const medicinename = tabletname.split(' ')[0] || '';

        if (event.target.id === `medicinename${id}`) {
          try {
            const response = await axios.get(`http://localhost:3000/allstock?medicinename=${medicinename}&dosage=${dosage}`);
            const expired = response.data.expired;

            if (expired) {
              const expiredDate = new Date(expired);
              const expiredDateString = expiredDate.toISOString().split('T')[0]; // Extracts the date portion

              alert(`Medicine expired on ${expiredDateString} !`);
              const medicineNameInput = inputRefs.current[id]?.[0];
              if (medicineNameInput) {
                medicineNameInput.value = '';
              }
            }

          } catch (error) {
            console.error('Error fetching medicine details:', error);
            alert(`Medicine "${medicinename}" not available in the database.`);
            const medicineNameInput = inputRefs.current[id]?.[0];
            if (medicineNameInput) {
              medicineNameInput.value = '';
            }
          }

          try {
            const response = await axios.get(`http://localhost:3000/getMRP?medicinename=${medicinename}&dosage=${dosage}`);
            const mrp = response.data.mrp;
            console.log("price", mrp)

            const qtyPriceInput = inputRefs.current[id]?.[2];
            if (qtyPriceInput) {
              qtyPriceInput.value = mrp || '';
            }
          } catch (error) {
            console.error('Error fetching MRP:', error);
          }

          try {
            const response = await axios.get(`http://localhost:3000/quantity?medicinename=${medicinename}&dosage=${dosage}`);
            const availableQuantity = response.data.availableQuantity;

            const qty = parseFloat(inputRefs.current[id]?.[1].value) || 0;
            // Compare entered quantity with available quantity
            if (qty > availableQuantity) {
              alert(`Quantity not available. Available Quantity: ${availableQuantity}`);
              const qtyInput = inputRefs.current[id] && inputRefs.current[id][1];
              if (qtyInput) {
                qtyInput.value = '';
              }
            }
          } catch (error) {
            console.error('Error fetching available quantity:', error);
          }
        }


        setMedicineRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, total } : row
          )
        );

        const totalInput = inputRefs.current[id]?.[3];
        if (totalInput) {
          totalInput.value = total.toFixed(2);
        }
      }


      const newSubtotal = medicineRows.reduce((acc, row) => acc + (row.total || 0), 0);
      setSubtotal(newSubtotal);

      const newGrandTotal = newSubtotal - discount;
      setGrandTotal(newGrandTotal);
    }
  };

  const handleCashGivenChange = (event) => {
    const newCashGiven = event.target.value;
    setCashGiven(newCashGiven);
  };
  
  useEffect(() => {
    if (cashGiven !== '' && grandtotal !== '') {
      const newCashGiven = parseFloat(cashGiven) || 0;
      const newBalance = newCashGiven - grandtotal;
      setBalance(newBalance);
    }
  }, [cashGiven, grandtotal]); 

  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const formattedValue = inputValue.replace(/\D/g, '').slice(0, 10);
    setMobileNo(formattedValue);
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
  
 
  
  const handleSubmit = async () => {
    // Check if at least one medicine row is filled
    const isAnyFieldFilled = medicineRows.some((row) => {
      const isFilled = inputRefs.current[row.id].some((input) => !!input.value.trim());
      return isFilled;
    });
  
    if (!isAnyFieldFilled) {
      alert('Please fill in at least one input field.');
      return;
    }
  
    const updatedMedicineRows = medicineRows
      .map((row) => {
        const medicinename = inputRefs.current[row.id][0].value.trim();
        const qty = parseFloat(inputRefs.current[row.id][1].value) || '';
        const qtyprice = parseFloat(inputRefs.current[row.id][2].value) || '';
        const total = qty * qtyprice;
  
        // Skip rows where at least one field is empty
        if (!medicinename || !qty || !qtyprice) {
          return null;
        }
  
        inputRefs.current[row.id][3].value = total.toFixed(2);
  
        return {
          id: row.id,
          medicinename: medicinename,
          qty: qty.toString(),
          qtyprice: qtyprice.toString(),
          total: total.toFixed(2),
        };
      })
      // Filter out rows that were skipped (where at least one field is empty)
      .filter((row) => row !== null);
  
    setSubmittedData(updatedMedicineRows);
  
    const newSubtotal = updatedMedicineRows.reduce((acc, row) => acc + parseFloat(row.total || 0), 0);
    setSubtotal(newSubtotal);
  
    const newGrandTotal = newSubtotal - discount;
    setGrandTotal(newGrandTotal);
  
    const billingData = {
      medicineRows: updatedMedicineRows,
      subtotal: newSubtotal,
      discount: discount,
      grandtotal: newGrandTotal,
      patientname: document.getElementById('patientname').value || '',
      doctorname: document.getElementById('doctorname').value || '',
      mobileno: document.getElementById('mobileno').value || '',
      cashgiven: cashGiven,
      balance: balance,
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
  const handleCancel = () => {
    // Set isSubmitted to false when Cancel button is clicked
    setIsSubmitted(false);
  
    
  };

  const handlePdf = () => {
    const capture = document.querySelector('.bill');
    setLoader(true);
    const html2canvasOptions = {
      scale: 2,
      logging: false,
      allowTaint: true,
    };

    html2canvas(capture, html2canvasOptions).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const jsPDFOptions = {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      };

      const doc = new jsPDF(jsPDFOptions);
      const imageWidth = 180;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      doc.addImage(imgData, 'PNG', 0, 0, imageWidth, imageHeight);
      setLoader(false);
      doc.save('bill.pdf');
}); };

  
const handleWhatsApp = () => {
  const phoneNumber = `${countryCode}${mobileNo}`;
  let message = `Hello! Your bill details:\n`;
  message += `Subtotal: ${subtotal}\n`;
  message += `Discount: ${discount}\n`;
  message += `Grand Total: ${grandtotal}\n\nPurchased Tablets:\n`;

  // Construct a table-like representation for medicine details
  message += 'S.No | Medicine Name | Qty | Price | Total\n';
  message += '--------------------------------------------\n';

  submittedData.forEach((data, index) => {
    const { medicinename, qty, qtyprice, total } = data;
    message += `${index + 1} | ${medicinename} | ${qty} | ${qtyprice} | ${total}\n`;
  });

  // Create a link with the WhatsApp message format
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Open the link in a new tab/window
  window.open(whatsappLink, '_blank');
};
const handleCance = () => {
  // Reset all the necessary state values to their initial values
  setMedicineRows([]);
  setSubtotal(0);
  setGrandTotal(0);
  setMobileNo('');
  setCashGiven(0);
  setBalance(0);
  setCountryCode('+91');
  setDiscountTotal(0);
  // setLoader(false);
  

  // Clear input values using refs
  Object.values(inputRefs.current).forEach((refs) => {
    refs.forEach((ref) => {
      if (ref) {
        ref.value = '';
      }
    });
  });
  setIsSubmitted(false);
};



  return (
    <div>
      {!isSubmitted ? (
        <div className="container" style={{ 
          // display: 'flex',
          // alignItems: 'center',
          // justifyContent: 'center',
          height: '100vh',
          backgroundImage: `url(${bgImage})`, // Set your background image
          backgroundSize: '100%',
          marginLeft:'-30px',
          fontFamily: 'serif'
        }}>
        <div style={{marginLeft:'60px'}}>
          <div className=' d-flex justify-content-between align-items-center mb-3' >
            <h2 className="mb-0"  style={{marginTop:'40px'}}><b>Billing</b>
            </h2>

          </div>
          <div className="container mt-1">
            <div className='row'>
              <div className='col-4 ms-2'><b>Medicine Name</b></div>
              <div className='col-2 ms-1'><b>Quantity</b></div>
              <div className='col-2 ms-1'><b>Price</b></div>
              <div className='col-2 ms-1'><b>Total</b></div>
            </div>

            {medicineRows.map(({ id, refs }, rowIndex) => (
              <div className="row mt-2" key={id}>
                <div className="col-4">
                  <input
                    id={`medicinename${id}`}
                    type="text"
                    className="form-control"
                    placeholder="Enter Name"
                    onChange={(e) => handleMedicineNameChange(e, id)}
                    ref={(el) => (inputRefs.current[id] ||= [])[0] = el}
                    onKeyPress={(e) => handleKeyPress(e, rowIndex, 0, id)}
                    list="medicineSuggestions"
                  />
                  {suggestions.length > 0 && (
                    <datalist id="medicineSuggestions">
                      {suggestions.map((suggestion, index) => (
                        <option
                          key={index}
                          value={`${suggestion.medicinename} ${suggestion.dosage}`}
                        />
                      ))}
                    </datalist>
                  )}
                </div>
                <div className="col-2 ms-1">
                  <input
                    id={`qty${id}`}
                    type="number"
                    className="form-control"
                    placeholder='qty'
                    ref={(el) => (inputRefs.current[id] ||= [])[1] = el}
                    onKeyPress={(e) => handleKeyPress(e, rowIndex, 1, id)}
                  />
                </div>
                <div className="col-2 ms-1">
                  <input
                    id={`qtyprice${id}`}
                    type="number"
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
              <div className="row mt-1 me-5">
                <div className="col-12 text-center">
                  <b><label className="me-3"  >Sub Total</label></b>
                  <input id="subtotal" type="number" className="border-0 text-start" style={{ width: '100px' }} value={subtotal} readOnly />
                </div>
              </div>

              <div className="row mt-1 me-5">
                <div className="col-12 text-center">
                  <b><label className="me-3" >Discount</label></b>
                  <input
                    id="discount"
                    className="border-0 text-start p-1"
                    type="number"
                    value={discount}
                    onChange={handleDiscountChange}
                    onKeyPress={(e) => handleKeyPress(e, 0, 0, 'discount')} style={{ width: '100px' }}
                  />
                </div>
              </div>

              <div className="row mt-1 me-5">
                <div className="col-12 text-center ">

                  <div className="p-1 d-inline-block text-start" style={{ backgroundColor: 'teal' }}>
                    <b><label className="me-2 text-white"  >Grand Total</label></b>
                    <input
                      className="border-0 text-white text-start p-1"
                      style={{ backgroundColor: 'teal', width: '100px' }}
                      id="grandtotal"
                      type="number"
                      value={grandtotal}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div >
            <div className='row ms-3 mt-3 '>
              <div className='col-3 '><b><label >Patient Name</label></b>  <input type='text' id='patientname' onKeyPress={(e) => handleKeyPress(e, 0, 0, 'patientname')} /> </div>
              <div className='col-3'> <b><label>Doctor Name</label></b>  <input type='text' id='doctorname' onKeyPress={(e) => handleKeyPress(e, 0, 0, 'doctorname')} /> </div>
              <div className='col-6'> <b><label htmlFor='mobileno'><b>Mobile No</b></label></b>
                <div style={{ display: 'flex' }}>
                  <select id='countryCode' value={countryCode} onChange={handleCountryCodeChange}>
                    <option value='+91'>+91 (India)</option>
                    <option value='+1'>+1 (US)</option>
                    <option value='+44'>+44 (UK)</option>
                  </select>
                  <input
                    type='tel'
                    id='mobileno'
                    value={mobileNo}
                    onChange={handleInputChange}
                    style={{ marginLeft: '5px' }}
                  />
                </div>
              </div>
            </div>

            <div className='row ms-3  mt-3 '>
              <div className='col-6'></div>
              
              <div className='col-2'><b><label>Cash Given</label></b>  <input type='number' id='cashgiven' value={cashGiven} onChange={handleCashGivenChange} onKeyPress={(e) => handleKeyPress(e, 0, 0, 'cashgiven')} style={{ width: '130px' }} /></div>
              
              <div className='col-2'><b><label>Balance</label></b>  <input type='text' id='balance' value={balance} readOnly style={{ width: '130px' }} />
              </div>
            </div>
            <div className="row mt-1 mb-2 p-3 ">
            <div className="col-md-12 text-end">
              <button type="button" className="btn me-2" onClick={handleCance}>Cancel</button>
              <button type="button" style={{ backgroundColor: 'teal', color: 'white' }} className="btn" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
          </div>
         </div>
        </div>
      ) : (<div className="container" id="dev">
      <div className="bill" style={{ textAlign: 'center' }}>
        <div className="d-flex align-items-center">
          <h4 className="text-xl font-weight-bold mb-0">
            <b>ALAGAR CLINIC</b>
          </h4>
        </div>
        <div className="col-md-12 text-end" style={{ marginTop: '20px' }}>
          <button
            type="button"
            style={{ backgroundColor: 'teal', color: 'white', marginRight: '10px', fontFamily: 'Arial, sans-serif', fontSize: '16px' }}
            className="btn"
            onClick={handleWhatsApp}
          >
            WhatsApp
          </button>
          <button
            type="button"
            style={{ backgroundColor: 'teal', color: 'white', marginRight: '10px', fontFamily: 'Arial, sans-serif', fontSize: '16px' }}
            className="btn"
            onClick={handlePdf}
            disabled={!(loader === false)}
          >
            Download PDF
          </button>
          <ReactToPrint
                trigger={() => (
                  <button type="button" className="btn" style={{ backgroundColor: 'teal', color: 'white' }}>
                    Print
                  </button>
                )}
                content={() => componentRef.current}
              />
        </div>

        <table border="2" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead style={{ backgroundColor: '#f2f2f2' }}>
            <tr>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>S.No</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Product Description</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Price</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Qty</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {submittedData.map((data) => (
              <tr key={data.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', textAlign: 'left' }}>{data.id}</td>
                <td style={{ padding: '10px', textAlign: 'left' }}>{data.medicinename}</td>
                <td style={{ padding: '10px', textAlign: 'left' }}>{data.qtyprice}</td>
                <td style={{ padding: '10px', textAlign: 'left' }}>{data.qty}</td>
                <td style={{ padding: '10px', textAlign: 'left' }}>{data.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="col-md-12 mt-3 text-start" style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
        Cash Given: {cashGiven}
      </div>
      <div className="col-md-12 mt-3 text-start" style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
        Balance: {balance}
      </div>
      <div className="col-md-12 mt-3 text-end" style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
        Subtotal: {subtotal}
      </div>

      <div className="col-md-12 mt-3 text-end" style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
        Discount: <span>{discount}</span>
      </div>

      <div className="col-md-12 mt-3 text-end" style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
        Grand Total: {grandtotal}
      </div>

      <button type="button" className="btn me-2" style={{ backgroundColor: 'green', color: 'white' }} onClick={handleCancel}>
        Cancel
      </button>
    </div>
  )}
    </div>
  );
}

export default Billing;