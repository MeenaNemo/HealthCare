import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import billbg from "../logo/ac.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/stock.css";
import FloatingAlert from "./floatingalert";
import "../styles/billing.css";

function Billing() {
  const [medicineRows, setMedicineRows] = useState(
    Array.from({ length: 3 }, (_, index) => ({ id: index + 1 }))
  );
  const [subtotal, setSubtotal] = useState("");
  const [discount, setDiscountTotal] = useState("0");
  const [grandtotal, setGrandTotal] = useState("");
  const [submittedData, setSubmittedData] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const inputRefs = useRef([]);
  const [loader, setLoader] = useState(false);
  const [cashGiven, setCashGiven] = useState("0");
  const [balance, setBalance] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [suggestions, setSuggestions] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [buttonText, setButtonText] = useState('Add More Medicine');


  const showAlert = (message, type, duration = 3000) => {
    setAlert({ message, type });

    setTimeout(() => {
      setAlert({ message: "", type: "" });
    }, duration)
  };

  useEffect(() => {
    const handleResize = () => {
      setButtonText(window.innerWidth <= 767 ? 'Add More' : 'Add More Medicine');
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setMedicineRows((prevRows) => {
      const newRows = prevRows.map((row) => ({
        ...row,
        refs: Array.from(
          { length: 4 },
          (_, i) => inputRefs.current[row.id]?.[i] || null
        ),
      }));
      return newRows;
    });
  }, []);

  useEffect(() => {
    if (cashGiven !== "" && grandtotal !== "") {
      const newCashGiven = parseFloat(cashGiven) || "";
      const newBalance = (newCashGiven - grandtotal).toFixed(2);
      setBalance(newBalance);
    }
  }, [cashGiven, grandtotal]);

  const currentDateFormatted = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  const handleMedicineNameChange = async (event, id) => {
    const inputValue = event.target.value;
    const sanitizedValue = inputValue.replace(/^\d*/, "");

    event.target.value = sanitizedValue;

    try {
      const response = await axios.get(
        `http://localhost:3000/suggestions?partialName=${inputValue}`
      );
      const fetchedSuggestions = response.data.suggestions;
      setSuggestions(fetchedSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
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

    const tabletname = inputRefs.current[id]?.[0].value || "";
    const { medicinename, dosage } = extractMedicineInfo(tabletname);

    try {
      const response = await axios.get(
        `http://localhost:3000/quantity?medicinename=${medicinename}&dosage=${dosage}`
      );
      const availableQuantity = response.data.availableQuantity;

      const qty = parseFloat(inputRefs.current[id]?.[1].value) || 0;
      if (qty > availableQuantity) {
        showAlert(`Available Quantity: ${availableQuantity}`);
        console.log("AQ", availableQuantity);
        const qtyInput = inputRefs.current[id] && inputRefs.current[id][1];
        const priceInput = inputRefs.current[id] && inputRefs.current[id][2];

        if (qtyInput) {
          qtyInput.value = "";
          priceInput.value = "";
          totalInput.value = "";
        }
      }
    } catch (error) {
      console.error("Error fetching available quantity:", error);
    }

    setMedicineRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, total } : row))
    );
  };

  const handleTotal = () => {
    const newSubtotal = medicineRows
      .reduce((acc, row) => acc + (row.total || 0), 0)
      .toFixed(2);
    setSubtotal(newSubtotal);

    const newGrandTotal = (newSubtotal - discount).toFixed(2);
    setGrandTotal(newGrandTotal);
  };

  const extractMedicineInfo = (tabletname) => {
    const dosagePattern = /\b(\d+(?:mg|ml|gm))\b/g;

    const dosageMatch = tabletname.match(dosagePattern);
    const dosage = dosageMatch ? dosageMatch[0] : "";

    const medicinename = tabletname.replace(dosagePattern, "").trim();

    return { medicinename, dosage };
  };

  const handleKeyPress = async (event, rowIndex, colIndex, id) => {
    const medicineNameInput = inputRefs.current[id]?.[0];
    const empty = medicineNameInput?.value || "";

    if (empty.trim() === "") {
      return;
    }

    if (event.target.tagName.toLowerCase() === "input") {
      event.preventDefault();
      if (colIndex === 0 || colIndex === 1 || colIndex === 2) {
        const tabletname = inputRefs.current[id]?.[0].value || "";
        const { medicinename, dosage } = extractMedicineInfo(tabletname);

        if (event.target.id === `medicinename${id}`) {
          try {
            const response = await axios.get(
              `http://localhost:3000/allstock?medicinename=${medicinename}&dosage=${dosage}`
            );
            const expired = response.data.expired;

            if (expired) {
              const expiredDate = new Date(expired);
              const expiredDateString = expiredDate.toISOString().split("T")[0];
              showAlert(
                `${medicinename} ${dosage} expired on ${expiredDateString} !`
              );
              const medicineNameInput = inputRefs.current[id]?.[0];
              if (medicineNameInput) {
                medicineNameInput.value = "";
              }
            }
          } catch (error) {
            if (event.target.id !== "") {
              showAlert(`"${medicinename}" Stock not available .`);
              const medicineNameInput = inputRefs.current[id]?.[0];
              if (medicineNameInput) {
                medicineNameInput.value = "";
              }
            }
          }

          try {
            const response = await axios.get(
              `http://localhost:3000/getMRP?medicinename=${medicinename}&dosage=${dosage}`
            );
            const mrp = response.data.mrp;

            const qtyPriceInput = inputRefs.current[id]?.[2];
            if (qtyPriceInput) {
              qtyPriceInput.value = mrp || "";
            }
          } catch (error) {
            console.error("Error fetching MRP:", error);
          }
        }
      }
    }
  };

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

  const handleCashGivenChange = (event) => {
    const newCashGiven = event.target.value;
    setCashGiven(newCashGiven);
  };

  const handleCashGivenBlur = () => {
    const formattedValue = parseFloat(cashGiven.replace(/[^\d.]/g, 0)).toFixed(
      2
    );
    setCashGiven(formattedValue);
  };

  const handleDiscountBlur = () => {
    const discountValue =
      typeof discount === "number"
        ? discount
        : parseFloat(discount.replace(/[^\d.]/g, 0));

    const formattedValue = discountValue.toFixed(2);
    setDiscountTotal(formattedValue);
  };
  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const formattedValue = inputValue.replace(/\D/g, "").slice(0, 10);
    setMobileNo(formattedValue);
  };

  const handleDiscountChange = (event) => {
    const newDiscountTotal = parseFloat(event.target.value) || "";
    setDiscountTotal(newDiscountTotal);

    const newGrandTotal = subtotal - newDiscountTotal;
    setGrandTotal(newGrandTotal);
  };

  const handleRemoveMedicine = (id) => {
    setMedicineRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleSubmit = async () => {
    let hasIncompleteRow = false;

    const updatedMedicineRows = medicineRows
      .map((row) => {
        const medicinename = inputRefs.current[row.id][0].value.trim();
        const qty = parseFloat(inputRefs.current[row.id][1].value) || "";
        const qtyprice = parseFloat(inputRefs.current[row.id][2].value) || "";
        const total = parseFloat(inputRefs.current[row.id][3].value) || "";

        if (
          (medicinename || qty || qtyprice) &&
          !(medicinename && qty && qtyprice)
        ) {
          showAlert("Please fill in all fields", "error");
          hasIncompleteRow = true;

          return null;
        }
        inputRefs.current[row.id][3].value = total;

        return {
          id: row.id,
          medicinename: medicinename,
          qty: qty.toString(),
          qtyprice: qtyprice.toString(),
          total: total,
        };
      })
      .filter(
        (row) => row && row.medicinename && row.medicinename.trim() !== ""
      );

    if (hasIncompleteRow) {
      return;
    }

    const patientName = document.getElementById("patientname").value.trim();
    if (!patientName) {
      showAlert("Please fill the Patient Name");
      return;
    }

    const mobileno = document.getElementById("mobileno").value.trim();
    if (!mobileno || mobileno.length < 10) {
      showAlert("Check Mobile Number");
      return;
    }

    const cashgiven = document.getElementById("cashgiven").value.trim();
    if (!cashgiven) {
      showAlert("Please fill the Cash given");
      return;
    }

    setSubmittedData(updatedMedicineRows);

    const billingData = {
      medicineRows: updatedMedicineRows,
      subtotal: document.getElementById("subtotal").value || "",
      discount: discount,
      grandtotal: document.getElementById("grandtotal").value || "",
      patientname: document.getElementById("patientname").value || "",
      doctorname: document.getElementById("doctorname").value || "",
      mobileno: document.getElementById("mobileno").value || "",
      cashgiven: cashgiven,
      balance: balance,
      medicinename: updatedMedicineRows.map((row) => row.medicinename),
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/billing",
        billingData
      );
      const generatedInvoiceNumber = response.data.invoicenumber;
      console.log("Generated Invoice Number:", generatedInvoiceNumber);

      setIsSubmitted(true);
      showAlert("Successfully submitted!", "success");

      setInvoiceNumber(generatedInvoiceNumber);
    } catch (error) {
      console.error("Error submitting billing data:", error);
    }
  };

  const handlePdf = () => {
    const capture = document.querySelector(".bill");
    setLoader(true);
    const html2canvasOptions = {
      scale: 2,
      logging: false,
      allowTaint: true,
    };

    html2canvas(capture, html2canvasOptions).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const jsPDFOptions = {
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      };

      const doc = new jsPDF(jsPDFOptions);
      const imageWidth = 180;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      const marginLeft = (doc.internal.pageSize.width - imageWidth) / 2;
      const marginTop = (doc.internal.pageSize.height - imageHeight) / 2;

      doc.addImage(
        imgData,
        "PNG",
        marginLeft,
        marginTop,
        imageWidth,
        imageHeight
      );
      setLoader(false);
      doc.save("bill.pdf");
    });
  };

  const handleWhatsApp = () => {
    const phoneNumber = `${countryCode}${mobileNo}`;
    let message = `Hello! Your bill details:\n`;
    message += `Subtotal: ${subtotal}\n`;
    message += `Discount: ${discount}\n`;
    message += `Grand Total: ${grandtotal}\n\nPurchased Tablets:\n`;

    message += "S.No | Medicine Name | Qty | Price | Total\n";
    message += "--------------------------------------------\n";

    submittedData.forEach((data, index) => {
      const { medicinename, qty, qtyprice, total } = data;
      message += `${index + 1
        } | ${medicinename} | ${qty} | ${qtyprice} | ${total}\n`;
    });

    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappLink, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = () => {
    setSubtotal("");
    setGrandTotal("");
    setMobileNo("");
    setCashGiven("");
    setBalance("");
    setCountryCode("+91");
    setDiscountTotal("");

    Object.values(inputRefs.current).forEach((refs) => {
      refs.forEach((ref) => {
        if (ref) {
          ref.value = "";
        }
      });
    });
    setIsSubmitted(false);
    window.location.reload();
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


// @media screen and (max-width: 767px) {
//   .btn {
//     font-size: 12px; // Adjust the font size for small screens
//   }

//   h2 {
//     font-size: 18px; // Adjust the font size for small screens
//   }

//   th h5, td input {
//     font-size: 14px; // Adjust the font size for small screens
//   }

//   label, input, b {
//     font-size: 12px; // Adjust the font size for small screens
//   }

// }
        `
        }
      </style>
      <div className="container" style={{ fontFamily: 'serif' }}>
        {!isSubmitted ? (
          <div className="row">
            <div className="container">
              <div className="mt-4">
                <h2 className="text-start">
                  <b>Billing</b>
                </h2>
              </div>
              <div
                className="bg-white border rounded p-5 pt-0"
                style={{ maxWidth: "1000px", margin: "0" }}
              >
                <div className="table-responsive">
                  <table className="table custom-table-no-border ">
                    <thead>
                      <tr>
                        <th>
                          <h5>
                            <b className="ms-1">Medicine Name</b>
                          </h5>
                        </th>
                        <th>
                          <h5>
                            <b className="ms-1">Quantity</b>
                          </h5>
                        </th>
                        <th>
                          <h5>
                            <b className="ms-1">Price</b>
                          </h5>
                        </th>
                        <th>
                          <h5>
                            <b className="ms-1">Total</b>
                          </h5>
                        </th>
                        <th></th> {/* Empty column for the button */}
                      </tr>
                    </thead>
                    <tbody>
                      {medicineRows.map(({ id, refs }, rowIndex) => (
                        <tr key={id}>
                          <td>
                            <input
                              id={`medicinename${id}`}
                              type="text"
                              className="form-control"
                              placeholder="Enter Name"
                              onChange={(e) => handleMedicineNameChange(e, id)}
                              ref={(el) =>
                                ((inputRefs.current[id] ||= [])[0] = el)
                              }
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
                          </td>
                          <td>
                            <input
                              id={`qty${id}`}
                              type="number"
                              className="form-control"
                              placeholder="Enter Qty"
                              ref={(el) =>
                                ((inputRefs.current[id] ||= [])[1] = el)
                              }
                              onBlur={(e) => handleQuantity(e, rowIndex, 1, id)}
                              onFocus={handleTotal}
                              style={{
                                WebkitAppearance: "none",
                                MozAppearance: "textfield",
                              }}
                            />
                          </td>
                          <td>
                            <input
                              id={`qtyprice${id}`}
                              type="number"
                              className="form-control "
                              ref={(el) =>
                                ((inputRefs.current[id] ||= [])[2] = el)
                              }
                              onFocus={handleTotal}
                              readOnly
                              style={{
                                WebkitAppearance: "none",
                                MozAppearance: "textfield",
                              }}
                            />
                          </td>
                          <td>
                            <input
                              id={`total${id}`}
                              type="text"
                              className="form-control "
                              ref={(el) =>
                                ((inputRefs.current[id] ||= [])[3] = el)
                              }
                              onFocus={handleTotal}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn "
                              style={{
                                backgroundColor: "white",
                                border: "1px solid lightgray",
                              }}
                              onClick={() => handleRemoveMedicine(id)}
                            >
                              <FontAwesomeIcon
                                icon={faTimesCircle}
                                style={{ color: "black" }}
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <FloatingAlert message={alert.message} type={alert.type} />

                <div className="row mt-0">
                  <div className="col-12 col-md-6">
                    <button
                      type="button"
                      className="btn ms-md-3 btn-sm"
                      style={{
                        backgroundColor: "teal",
                        color: "white",
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                      }}
                      onClick={handleAddMedicine}
                    >
                      {buttonText}
                    </button>
                  </div>
                  <div className=" col-12 col-md-5 d-flex flex-column align-items-end" >
                    <div className="mt-0">
                      <b>
                        <label className="me-4">Sub Total</label>
                      </b>
                      <input
                        id="subtotal"
                        type="number"
                        className="border-0 text-start"
                        style={{
                          width: "70px",
                          background: "none",
                          WebkitAppearance: "none",
                          MozAppearance: "textfield",
                        }}
                        value={subtotal}
                        readOnly
                      />
                    </div>

                    <div className="mt-1">
                      <b>
                        <label className="me-4">Discount</label>
                      </b>
                      <input
                        id="discount"
                        className="border-0 text-start p-1"
                        type="number"
                        value={discount}
                        onChange={handleDiscountChange}
                        onBlur={handleDiscountBlur}
                        style={{
                          width: "75px",
                          background: "none",
                          WebkitAppearance: "none",
                          MozAppearance: "textfield",
                        }}
                      />
                    </div>

                    <div className="mt-1">
                      <div
                        className="p-1 d-inline-block text-start"
                        style={{ backgroundColor: "teal", height: "30px" }}
                      >
                        <b>
                          <label className="me-2 text-white">Grand Total</label>
                        </b>
                        <input
                          className="border-0 text-white text-start p-1"
                          style={{
                            backgroundColor: "teal",
                            width: "70px", 
                            height: "20px",
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                          }}
                          id="grandtotal"
                          type="number"
                          value={grandtotal}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mt-3 ms-2 ">
  <div className="col-md-3 me-5">
    <b>
      <label>Patient Name</label>
    </b>
    <div>
      <input
        type="text"
        id="patientname"
        onBlur={(e) => handleKeyPress(e, 0, 0, "patientname")}
        onFocus={handleTotal}
        className="form-control"
      />
    </div>
    <br />
  </div>

  <div className="col-md-3 me-5">
    <b>
      <label>Doctor Name</label>
    </b>
    <div>
      <input
        type="text"
        id="doctorname"
        value="Dr.G.Vasudevan M.S"
        className="form-control"
        onBlur={(e) => handleKeyPress(e, 0, 0, "doctorname")}
      />
    </div>
    <br />
  </div>

  <div className="col-md-3">
    <div className="row">
      <b>
        <label htmlFor="mobileno">
          <b>Mobile No</b>
        </label>
      </b>
    </div>
    <div className="row">
      <div className="d-flex">
        <select
          id="countryCode"
          value={countryCode}
          onChange={handleCountryCodeChange}
          className="me-1 form-select"
          style={{ width: "80px" }} // Adjust the width of the select box
        >
          <option value="+91">+91 (India)</option>
          <option value="+1">+1 (US)</option>
          <option value="+44">+44 (UK)</option>
        </select>
        <input
          type="tel"
          id="mobileno"
          value={mobileNo}
          onChange={handleInputChange}
          className="form-control"
          style={{ flex: "3" }} // Make the input box expand to fill remaining space
        />
      </div>
    </div>
  </div>
</div>

                <div className="row  ms-2">
                  <div className="col-md-3 me-5">
                    <b>
                      <label>Invoice Date</label>
                    </b>{" "}
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={currentDateFormatted}
                      readOnly
                    />
                  </div>
                  <div className="col-md-3 me-5">
                    <b>
                      <label>Cash Given</label>
                    </b>
                    <input
                      type="text"
                      id="cashgiven"
                      value={cashGiven}
                      onChange={handleCashGivenChange}
                      onBlur={handleCashGivenBlur}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-3 me-5">
                    <b>
                      <label>Balance</label>
                    </b>
                    <div>
                      <input
                        type="text"
                        id="balance"
                        value={balance}
                        readOnly
                        className="form-control"

                      />
                    </div>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-md-12 text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={handleCancel}
                      style={{ backgroundColor: "teal", color: "white" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn "
                      style={{ backgroundColor: "teal", color: "white" }}
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-12 text-center mt-4">
              <button
                type="button"
                className="btn me-2"
                onClick={handleWhatsApp}
                style={{
                  backgroundColor: "teal",
                  color: "white"}}
              >
                WhatsApp
              </button>
              <button
                type="button"
                className="btn  me-2"
                onClick={handlePdf}
                disabled={loader === true}
                style={{
                  backgroundColor: "teal",
                  color: "white"}}
              >
                Download PDF
              </button>
              <button
                type="button"
                className="btn "
                onClick={handlePrint}
                style={{
                  backgroundColor: "teal",
                  color: "white"}}
              >
                Print
              </button>
            </div>
          </div>
        
          <div className="row justify-content-center mt-4">
            <div className="col-md-10 col-lg-8">
              <div className="bill " style={{ border: "1px solid black", backgroundImage: `url(${billbg})`, backgroundSize: "100% 100%", height:'100vh' }}>
                <div className="text-end me-5" style={{marginTop:'80px'}}>
                  <h3 className="me-4" style={{ color: "darkblue" }}>Invoice</h3>
                  <h6>Invoice No: {invoiceNumber}</h6>
                  <h6>Invoice Date: {currentDateFormatted}</h6>
                </div>
        
                <div className="table-responsive me-5 ms-5">
                  <table className="table table-bordered table-striped p-5 ">
                    <thead className="table-dark">
                      <tr>
                        <th className="text-center">S.No</th>
                        <th className="text-center">Medicine Name</th>
                        <th className="text-center">Price</th>
                        <th className="text-center">Qty</th>
                        <th className="text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(submittedData) && submittedData.map((data, index) => (
                        <tr key={data.id}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{data.medicinename}</td>
                          <td className="text-center">{data.qtyprice}</td>
                          <td className="text-center">{data.qty}</td>
                          <td className="text-center">{data.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
        
                <div className="d-flex justify-content-between m-5">
                  <div>
                    <div className="text-start">
                      <p>Cash Given: {cashGiven}</p>
                      <p>Balance: {balance}</p>
                    </div>
                  </div>
                  <div>
                    <div className="text-end">
                      <p>Subtotal: {subtotal}</p>
                      <p>Discount: <span>{discount}</span></p>
                      <p>Grand Total: {grandtotal}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "teal",
                    color: "white"}}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>


          
        </div>
        
        )}
      </div>
    </>
  );
}

export default Billing;