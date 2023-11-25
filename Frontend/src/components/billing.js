import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import billbg from '../logo/ac.jpg'
import ReactToPrint from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/stock.css'




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
  const [invoiceNumber, setInvoiceNumber] = useState('');


  useEffect(() => {
    setMedicineRows((prevRows) => {
      const newRows = prevRows.map((row) => ({
        ...row,
        refs: Array.from({ length: 4 }, (_, i) => inputRefs.current[row.id]?.[i] || null),
      }));
      return newRows;
    });
  }, []);

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

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
    const sanitizedValue = inputValue.replace(/^\d*/, '');

  // Update the input value without leading numbers
  event.target.value = sanitizedValue;

    try {
      const response = await axios.get(`http://localhost:3000/suggestions?partialName=${inputValue}`);
      const fetchedSuggestions = response.data.suggestions;
      console.log ("sug", fetchedSuggestions)
      setSuggestions(fetchedSuggestions);


      // Handle selection logic for dosage and other details
      // ...
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleQuantity = async (event, rowIndex, colIndex, id) => {

    const qty = parseFloat(inputRefs.current[id]?.[1].value) || 0;
    const qtyprice = parseFloat(inputRefs.current[id]?.[2].value) || 0;
    const total = qty * qtyprice;
    const totalInput = inputRefs.current[id]?.[3];
    if (totalInput) {
      totalInput.value = total.toFixed(2);
    }

    const tabletname = inputRefs.current[id]?.[0].value || '';
    const { medicinename, dosage } = extractMedicineInfo(tabletname);

    try {
      const response = await axios.get(`http://localhost:3000/quantity?medicinename=${medicinename}&dosage=${dosage}`);
      const availableQuantity = response.data.availableQuantity;

      const qty = parseFloat(inputRefs.current[id]?.[1].value) || 0;
      if (qty > availableQuantity) {
        alert(`Available Quantity: ${availableQuantity}`);
        const qtyInput = inputRefs.current[id] && inputRefs.current[id][1];
        const priceInput = inputRefs.current[id] && inputRefs.current[id][2];

        if (qtyInput) {
          qtyInput.value = '';
          priceInput.value = '';
          totalInput.value = '';
        }
      }
    } catch (error) {
      console.error('Error fetching available quantity:', error);
    }


    setMedicineRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, total } : row
      )
    );

    const newSubtotal = medicineRows.reduce((acc, row) => acc + (row.total || 0), 0).toFixed(2);
    setSubtotal(newSubtotal);

    const newGrandTotal = (newSubtotal - discount).toFixed(2);
    setGrandTotal(newGrandTotal);
  }

  const extractMedicineInfo = (tabletname) => {
    // Define a regular expression pattern to match dosage (digits followed by "mg," "ml," or "gm")
    const dosagePattern = /\b(\d+(?:mg|ml|gm))\b/g;
  
    const dosageMatch = tabletname.match(dosagePattern);
    const dosage = dosageMatch ? dosageMatch[0] : '';
  
    const medicinename = tabletname.replace(dosagePattern, '').trim();
  
    return { medicinename, dosage };
  };

  const handleKeyPress = async (event, rowIndex, colIndex, id) => {

    const medicineNameInput = inputRefs.current[id]?.[0];
    const empty = medicineNameInput?.value || '';

    if (empty.trim() === '') {
      return; // Do nothing if the medicinename is empty
    }

    const isValidKey = /^[a-zA-Z0-9\s]*$/.test(event.key);
    const isWithinLength = mobileNo.length < 10;

    if (!isValidKey || !isWithinLength) {
      event.preventDefault();
    }

    if (event.target.tagName.toLowerCase() === 'input') {
      event.preventDefault();
      if (colIndex === 0 || colIndex === 1 || colIndex === 2) {
        const tabletname = inputRefs.current[id]?.[0].value || '';
        const { medicinename, dosage } = extractMedicineInfo(tabletname);

    
        if (event.target.id === `medicinename${id}`) {
          try {
            const response = await axios.get(`http://localhost:3000/allstock?medicinename=${medicinename}&dosage=${dosage}`);
            const expired = response.data.expired;

            if (expired) {
              const expiredDate = new Date(expired);
              const expiredDateString = expiredDate.toISOString().split('T')[0]; // Extracts the date portion

              alert(`${medicinename} ${dosage} expired on ${expiredDateString} !`);
              const medicineNameInput = inputRefs.current[id]?.[0];
              if (medicineNameInput) {
                medicineNameInput.value = '';
              }

            }

          } catch (error) {

            if (event.target.id !== '') {
              alert(`"${medicinename}" not available .`);
              const medicineNameInput = inputRefs.current[id]?.[0];
              if (medicineNameInput) {
                medicineNameInput.value = '';
              }
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


        }


      }



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
    const newDiscountTotal = parseFloat(event.target.value) || '';
    setDiscountTotal(newDiscountTotal);

    const newGrandTotal = subtotal - newDiscountTotal;
    setGrandTotal(newGrandTotal);
  };

  const handleRemoveMedicine = (id) => {
    setMedicineRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleSubmit = async () => {
    // Check if at least one row is fully filled
    const isAnyRowFilled = medicineRows.some((row) => {
      const isFilled = inputRefs.current[row.id].every((input) => !!input.value.trim() || input === inputRefs.current[row.id][0]);
      return isFilled;
    });
  
    if (!isAnyRowFilled) {
      alert('Please fill in all input fields for at least one row.');
      return;
    }
  
    const updatedMedicineRows = medicineRows
      .map((row) => {
        const medicinename = inputRefs.current[row.id][0].value.trim();
        const qty = parseFloat(inputRefs.current[row.id][1].value) || '';
        const qtyprice = parseFloat(inputRefs.current[row.id][2].value) || '';
        const total = qty * qtyprice;
  
        // Skip rows where all fields are empty
        if (!medicinename && !qty && !qtyprice) {
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
      // Filter out rows that were skipped (where all fields are empty)
      .filter((row) => row !== null);
  
    setSubmittedData(updatedMedicineRows);
  
    // Calculate subtotal, grand total, and other necessary data
    const newSubtotal = updatedMedicineRows.reduce((acc, row) => acc + parseFloat(row.total || 0), 0);
    setSubtotal(newSubtotal);
  
    const newGrandTotal = newSubtotal - discount;
    setGrandTotal(newGrandTotal);
  
    // Prepare billing data
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
  
    // Send data to the backend
    try {
      const response = await axios.post('http://localhost:3000/billing', billingData);
      const generatedInvoiceNumber = response.data.invoicenumber;
      console.log("Generated Invoice Number:", generatedInvoiceNumber);
  
      // Update state or perform other actions as needed
      setIsSubmitted(true);
      setInvoiceNumber(generatedInvoiceNumber);
    } catch (error) {
      console.error('Error submitting billing data:', error);
    }
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
  
      // Calculate center alignment
      const marginLeft = (doc.internal.pageSize.width - imageWidth) / 2;
      const marginTop = (doc.internal.pageSize.height - imageHeight) / 2;
  
      doc.addImage(imgData, 'PNG', marginLeft, marginTop, imageWidth, imageHeight);
      setLoader(false);
      doc.save('bill.pdf');
    });
  };

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
  const handlePrint = () => {
    window.print();
  };

  const handleCancel = () => {
    // Reset all the necessary state values to their initial values
    // setMedicineRows([]);
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
    <>
    <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .bill, .bill * {
              visibility: visible;
            }
            .bill {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              text-align: center;
            }

            /* Center content on the printed page */
            @page {
              size: A4;
              margin: 0;
              margin: 20mm;
            }
            @media print {
              html, body {
                height: 100%;
                margin: 0;
              }
              body {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12pt;
              }
              .bill {
                width: 100%;
                margin: 0;
                padding: 20px; /* Add padding for better visibility */
              }

              /* Increase font size */
              .bill {
                font-size: 14px; /* Adjust the font size as needed */
              }
              /* Adjust font size for specific elements */
              .bill h3 {
                font-size: 20px; /* Adjust the font size as needed */
              }
              .bill table {
                font-size: 12px; /* Adjust the font size as needed */
              }
            }
          }
        `}
      </style>
    <div>
      {!isSubmitted ? (
        <div className="container" style={{
          fontFamily: 'serif',
        }}>
          <div style={{ marginLeft: '20px' }}>
            <div className=' d-flex justify-content-between align-items-center mb-3' >
              <h2 className="mb-0" ><b>Billing</b>
              </h2>
            </div>
            <div style={{ backgroundColor: 'white', border: '1px solid lightgray' }}>

              <div className='mt-4 ms-5'>
                <div className="container mt-1">
                  <div className='row'>
                    <div className='col-4 ms-2'><h5><b>Medicine Name</b></h5></div>
                    <div className='col-2 ms-1'><h5><b>Quantity</b></h5></div>
                    <div className='col-2 ms-1'><h5><b>Price</b></h5></div>
                    <div className='col-2 ms-1'><h5><b>Total</b></h5></div>
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
                          onBlur={(e) => handleKeyPress(e, rowIndex, 0, id)}
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
                          placeholder='Enter Qty'
                          ref={(el) => (inputRefs.current[id] ||= [])[1] = el}
                          onBlur={(e) => handleQuantity(e, rowIndex, 1, id)}
                          style={{
                            WebkitAppearance: 'none', /* for WebKit browsers */
                            MozAppearance: 'textfield' /* for Firefox */
                          }}
                        />
                      </div>
                      <div className="col-2 ms-1">
                        <input
                          id={`qtyprice${id}`}
                          type="number"
                          className="form-control "
                          ref={(el) => (inputRefs.current[id] ||= [])[2] = el}
                          onBlur={(e) => handleKeyPress(e, rowIndex, 2, id)}
                          readOnly // Add readOnly attribute to make the input non-editable
                        // defaultValue={mrp || ''} 
                        />
                      </div>
                      <div className="col-2 ms-1">
                        <input
                          id={`total${id}`}
                          type="text"
                          className="form-control "
                          ref={(el) => (inputRefs.current[id] ||= [])[3] = el}
                          onBlur={(e) => handleQuantity(e, rowIndex, 3, id)}
                        />
                      </div>

                      <div className="col-1 ms-1">
                        <button
                          type="button"
                          className="btn "
                          style={{ backgroundColor: 'white', border: '1px solid lightgray' }}
                          // aria-label="Close"

                          onClick={() => handleRemoveMedicine(id)}
                        >
                          <FontAwesomeIcon icon={faTimesCircle} style={{ color: 'black' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <br />
                <div className="row mt-1">
                  <div className="col-6">
                    <button type="button" className="btn mt-1 ms-3" style={{ backgroundColor: 'teal', color: 'white' }} onClick={handleAddMedicine}>
                      Add More Medicine
                    </button>
                  </div>
                  <div className="col-6" >
                    <div className="row mt-1 ">
                      <div className="col-12 text-center">
                        <b><label className="me-4"  >Sub Total</label></b>
                        <input id="subtotal" type="number" className="border-0 text-start" style={{ width: '70px', background: 'none' }} value={subtotal} readOnly />
                      </div>
                    </div>

                    <div className="row mt-1">
                      <div className="col-12 text-center">
                        <b><label className="me-4" >Discount</label></b>
                        <input
                          id="discount"
                          className="border-0 text-start p-1"
                          type="number"
                          value={discount}
                          onChange={handleDiscountChange}
                          onBlur={(e) => handleKeyPress(e, 0, 0, 'discount')} style={{ width: '70px', background: 'none' }}
                        />
                      </div>
                    </div>

                    <div className="row mt-1">
                      <div className="col-12 text-center ">

                        <div className="p-1 d-inline-block text-start" style={{ backgroundColor: 'teal', height: '30px' }}>
                          <b><label className="me-2 text-white"  >Grand Total</label></b>
                          <input
                            className="border-0 text-white text-start p-1"
                            style={{ backgroundColor: 'teal', width: '80px', height: '20px' }}
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
                    <div className='col-3 '><b><label >Patient Name</label></b>  <input type='text' id='patientname' onBlur={(e) => handleKeyPress(e, 0, 0, 'patientname')} /> </div>
                    <div className='col-3'> <b><label>Doctor Name</label></b>
                      <input
                        type='text'
                        id='doctorname'
                        value='Dr G.Vasudevan' // Set your default value here
                        onBlur={(e) => handleKeyPress(e, 0, 0, 'doctorname')}
                      />

                    </div>
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
                    <div className='col-4'></div>
                    <div className='col-2'><b><label>Invoice Date</label></b> <input
          type='text'
          className='form-control border-0'
          defaultValue={currentDateFormatted}  readOnly style={{ width: '130px' }}
        /></div>        
                    <div className='col-2'><b><label>Cash Given</label></b>  <input type='number' id='cashgiven' value={cashGiven} onChange={handleCashGivenChange} onBlur={(e) => handleKeyPress(e, 0, 0, 'cashgiven')} style={{ width: '130px' }} /></div>

                    <div className='col-2'><b><label>Balance</label></b>  <input type='text' id='balance' value={balance} readOnly style={{ width: '130px' }} />
                    </div>
                  </div>
                  <div className="row mt-1 mb-2 p-3 me-5 ">
                    <div className="col-md-12 text-end ">
                      <button type="button" className="btn me-2" onClick={handleCancel}  style={{ backgroundColor: 'teal', color: 'white' }} >Cancel</button>
                      <button type="button" style={{ backgroundColor: 'teal', color: 'white' }} className="btn" onClick={handleSubmit}>Submit</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container" id="dev" >
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

            <button
          type="button"
          style={{ backgroundColor: 'teal', color: 'white' }}
          className="btn"
          onClick={handlePrint}
        >
          Print
        </button>

           
          </div>
          <div className="bill" style={{
            marginLeft: '180px',
            marginTop: '40px',
            backgroundColor: 'white',
            width: '65%',
            height: '800px',
            border: '1px solid black',
            backgroundImage: `url(${billbg})`, // Set your background image
            backgroundSize: '100% 100%',
            fontFamily: 'serif'
          }}>

            <div style={{ marginLeft: '70%', marginTop: '110px', height: '70px', lineHeight: '2px' }}>
              <div>
                <h3 style={{ color: 'darkblue' }}><b>Invoice</b></h3>
                <h6>Invoice No:{invoiceNumber}</h6>
                <h6>Invoice Date: {currentDateFormatted}</h6>
              </div>

            </div>

            <div style={{ width: '100%', marginTop: '5%' }}>
              <table style={{ width: '90%', margin: 'auto', borderCollapse: 'collapse' }}>
                <thead >
                  <tr style={{ color: 'white' }}>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', backgroundColor: '#2A4577' }}>S.No</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', backgroundColor: '#2A4577' }}>Medicine Name</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', backgroundColor: '#2A4577' }}>Price</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', backgroundColor: '#2A4577' }}>Qty</th>
                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', backgroundColor: '#2A4577' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedData.map((data, index) => (
                    <tr key={data.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{data.medicinename}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{data.qtyprice}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{data.qty}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{data.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>

            <div className="d-flex align-items-center justify-content-between ms-5" style={{ marginTop: '200px' }}>
              <div>
                <div className="col-md-12 mt-3 text-start">
                  Cash Given: {cashGiven}
                </div>
                <div className="col-md-12 mt-3 text-start">
                  Balance: {balance}
                </div>
              </div>
              <div style={{ marginRight: '40px' }}>
                <div className="col-md-12 mt-3 text-end">
                  Subtotal: {subtotal}
                </div>

                <div className="col-md-12 mt-3 text-end">
                  Discount: <span>{discount}</span>
                </div>

                <div className="col-md-12 mt-3 text-end">
                  Grand Total: {grandtotal}
                </div>
              </div>
            </div>

          </div>
          <button type="button" className="btn me-2" style={{ backgroundColor: 'green', color: 'white' }} onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
    </>
  );
}

export default Billing;