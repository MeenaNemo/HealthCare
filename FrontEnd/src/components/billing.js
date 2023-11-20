import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


function Billing() {
  const [medicineRows, setMedicineRows] = useState(Array.from({ length: 4 }, (_, index) => ({ id: index + 1 })));
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
  const [countryCode, setCountryCode] = useState('+1');
  const [suggestions, setSuggestions] = useState('');
  // Default country code, change as needed

  useEffect(() => {
    // Initialize inputRefs with refs for each input field
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

  const handlePrint = () => {
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
    });
  };

  const handleSubmit = async () => {
    const isAnyFieldEmpty = medicineRows.some((row) => {
      const isEmpty = inputRefs.current[row.id].some((input) => !input.value.trim());
      return isEmpty;
    });

    if (isAnyFieldEmpty) {
      alert('Please fill in all the input fields.');
      return;
    }
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

  const handleWhatsApp = () => {
    // const countryCode='+91'
    // const mobileNo="6369183006"
    const phoneNumber = `${countryCode}${mobileNo}`;
    const message = `Hello! Your bill details:\nSubtotal: ${subtotal}\nDiscount: ${discount}\nGrand Total: ${grandtotal}`;

    // Create a link with the WhatsApp message format
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Open the link in a new tab/window
    window.open(whatsappLink, '_blank');
  }
  return (
    <div>
      {!isSubmitted ? (
        <div className="container" >
          <div className=' d-flex justify-content-between align-items-center mb-3'>
            <b><h2 className="mb-0">Billing
              <span>
                <button type="button" className="btn ms-3 mb-2" > + </button>
              </span>
            </h2></b>

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


          <div className='container '>
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
          <div className="bill" style={{ textAlign: 'center' }}>
            <div className="d-flex align-items-center">

              <h4 className="text-xl font-weight-bold mb-0"><b>ALAGAR CLINIC</b></h4>
            </div>
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
                    <td>{data.medicinename}</td>
                    <td>{data.qty}</td>
                    <td>{data.qtyprice}</td>
                    <td>{data.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4">Subtotal:</td>
                  <td>{subtotal}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="col-md-12 text-end">

            <button
              type="button"
              style={{ backgroundColor: 'teal', color: 'white' }}
              className="btn"
              onClick={handleWhatsApp}
            >
              WhatsApp
            </button>
            <button
              type="button"
              style={{ backgroundColor: 'teal', color: 'white' }}
              className="btn"
              onClick={handlePrint}
              disabled={!(loader === false)}>

              Print
            </button>
            <button type="button" className="btn me-2">Cancel</button>

          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;