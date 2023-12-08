import { React, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function AddMedicine() {
  const [formData, setFormData] = useState({
    medicinename: "",
    brandname: "",
    otherdetails: "",
    purchaseprice: "",
    totalqty: "",
    purchaseamount: 0,
    dosage: "",
    dosageUnit: "mg",
    expirydate: "",
    mrp: "",
  });
  const [popupType, setPopupType] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [dosageUnitPopupShown, setDosageUnitPopupShown] = useState(false);

  const handleChange = (event) => {
    const { id, value } = event.target;

    const numericValue = parseFloat(value);

    const inputElement = document.getElementById(id);
    if (inputElement) {
      inputElement.style.border = "";
      const errorMessageContainer = inputElement.parentNode.querySelector(
        ".error-message-container"
      );
      if (errorMessageContainer) {
        errorMessageContainer.remove();
      }
    }

    setFormData((prevData) => {
      let updatedData = {
        ...prevData,
        [id]:
          id === "medicinename" || id === "brandname"
            ? isNaN(numericValue)
              ? value
              : numericValue
            : prevData[id],
      };

      if (id === "purchaseprice" || id === "totalqty") {
        if (id === "totalqty") {
          const intValue = parseInt(value, 10);
          if (!isNaN(intValue)) {
            updatedData.totalqty = intValue;
            updatedData.purchaseamount =
              !isNaN(prevData.purchaseprice) && intValue
                ? prevData.purchaseprice * intValue
                : 0;
          }
        } else {
          const numericValue = parseFloat(value);
          if (!isNaN(numericValue)) {
            updatedData[id] = numericValue;
            updatedData.purchaseamount =
              id === "purchaseprice" && !isNaN(prevData.totalqty)
                ? numericValue * prevData.totalqty
                : id === "totalqty" && !isNaN(prevData.purchaseprice)
                ? prevData.purchaseprice * numericValue
                : 0;
          }
        }
      } else if (id === "mrp") {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          updatedData.mrp = numericValue;
        }
      } else if (id === "otherdetails") {
        updatedData.otherdetails = value;
      }

      if (id === "expirydate" && !isNaN(new Date(value).getTime())) {
        const selectedDate = new Date(value);
        const currentDate = new Date();

        if (selectedDate < currentDate) {
          setPopupType("error");
          setPopupMessage("Please enter a valid expiry date.");
          setShowPopup(true);

          setTimeout(() => {
            setShowPopup(false);
          }, 2000);

          return prevData;
        }
        updatedData.expirydate = new Date(value).toISOString().split("T")[0];
      }
      return updatedData;
    });
  };

  const handleDosageUnitChange = (event) => {
    const { value } = event.target;

    setFormData((prevData) => {
      const currentDosage = String(prevData.dosage);

      const dosageWithoutUnit = currentDosage.replace(/[^\d]/g, "");
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
      medicinename: "",
      brandname: "",
      otherdetails: "",
      purchaseprice: "",
      totalqty: "",
      purchaseamount: 0,
      dosage: "",
      dosageUnit: "mg",
      expirydate: "",
      mrp: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const emptyFields = Object.entries(formData).filter(([key, value]) => {
      return typeof value === "string" && !value.trim();
    });

    if (emptyFields.length > 0) {
      emptyFields.forEach(([key, _]) => {
        const element = document.getElementById(key);
        if (element) {
          element.classList.add("highlight-input");
        }
      });

      setTimeout(() => {
        emptyFields.forEach(([key, _]) => {
          const element = document.getElementById(key);
          if (element) {
            element.classList.remove("highlight-input");
          }
        });
        setShowPopup(false);
      }, 2000);
      return;
    }

    try {
      await axios.post("https://api.5ytechno.com/purchase", formData);
      setPopupType("success");
      setShowPopup(true);
      console.log("Form Submitted!");

      setFormData({
        medicinename: "",
        brandname: "",
        otherdetails: "",
        purchaseprice: "",
        totalqty: "",
        purchaseamount: 0,
        dosage: "",
        dosageUnit: "",
        expirydate: "",
        mrp: "",
      });

      setTimeout(() => {
        setShowPopup(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting data: " + error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const currentInputId = event.target.id;
      const inputOrder = [
        "medicinename",
        "dosage",
        "brandname",
        "otherdetails",
        "purchaseprice",
        "totalqty",
        "expirydate",
        "mrp",
      ];

      const currentIndex = inputOrder.indexOf(currentInputId);

      if (currentIndex !== -1 && currentIndex < inputOrder.length - 1) {
        const nextInputId = inputOrder[currentIndex + 1];
        document.getElementById(nextInputId).focus();
      }
    }
  };

  return (
    <>
      <style>
        {`
.highlight-input {
  border: 1px solid red;
}

`}
      </style>

      <div
        className="container"
        style={{
          fontFamily: "serif",
          width: "100%",
        }}
      >
        <div className="">
          <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
            <h2 className="mb-0">
              <b>Add Medicine</b>
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ backgroundColor: "white", border: "1px solid lightgray" }}
          >
            <div className="m-4">
              <div className="row">
                <div className="col-md-12 col-12 col-sm-12">
                  <div className="form-group  text-left rounded-3">
                    <b>
                      <label htmlFor="medicinename">Medicine Name</label>
                    </b>
                    <input
                      type="text"
                      className="form-control col-md-6 col-lg-4"
                      id="medicinename"
                      value={formData.medicinename}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
              </div>

              <br />

              <div className="row">
                <div className="col-md-6 col-12">
                  <div className="form-group  text-left rounded-3">
                    <b>
                      <label htmlFor="dosage">Dosage</label>
                    </b>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        id="dosage"
                        value={formData.dosage}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onInput={(e) => {
                          const numericValue = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                          setFormData((prevData) => ({
                            ...prevData,
                            dosage: numericValue,
                          }));
                        }}
                        onBlur={(e) => {
                          setFormData((prevData) => ({
                            ...prevData,
                            dosage: String(prevData.dosage).endsWith(
                              formData.dosageUnit
                            )
                              ? prevData.dosage
                              : prevData.dosage + prevData.dosageUnit,
                          }));
                        }}
                      />
                      <select
                        className="form-select w-15"
                        id="dosageUnit"
                        value={formData.dosageUnit}
                        onChange={(e) => {
                          handleDosageUnitChange(e);
                          const dosageInput = document.getElementById("dosage");
                          if (dosageInput) {
                            dosageInput.dispatchEvent(new Event("blur"));
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
                    <b>
                      <label htmlFor="brandName">Brand Name</label>
                    </b>
                    <input
                      type="text"
                      className="form-control"
                      id="brandname"
                      value={formData.brandname}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <br />
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 col-12 col-sm-12">
                  <div className="form-group  text-left rounded-3">
                    <b>
                      <label htmlFor="medicineName">Other Details</label>
                    </b>
                    <input
                      type="text"
                      className="form-control"
                      id="otherdetails"
                      value={formData.otherdetails}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <br />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 col-12 col-sm-4">
                  <div className="form-group  text-left rounded-3">
                    <b>
                      <label htmlFor="purchaseprice">Purchase Price</label>
                    </b>
                    <input
                      type="number"
                      className="form-control"
                      id="purchaseprice"
                      value={formData.purchaseprice}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      onInput={(e) => {
                        const numericValue = e.target.value.replace(
                          /[^0-9]/g,
                          ""
                        );
                        setFormData((prevData) => ({
                          ...prevData,
                          purchaseprice: numericValue,
                        }));
                      }}
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-4 col-12 col-sm-4">
                  <div className="form-group  text-left rounded-3">
                    <b>
                      <label htmlFor="totalqty">Total Qty</label>
                    </b>
                    <input
                      type="number"
                      className="form-control"
                      id="totalqty"
                      value={formData.totalqty}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      onInput={(e) => {
                        const numericValue = e.target.value.replace(
                          /[^0-9]/g,
                          ""
                        );
                        setFormData((prevData) => ({
                          ...prevData,
                          totalqty: numericValue,
                        }));
                      }}
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-4 col-12 col-sm-4">
                  <div className="form-group  text-left rounded-3">
                    <b>
                      <label htmlFor="purchaseamount">Purchase Amount</label>
                    </b>
                    <input
                      type="number"
                      className="form-control"
                      id="purchaseamount"
                      value={formData.purchaseamount}
                      readOnly
                      onKeyDown={handleKeyDown}
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                      }}
                    />
                  </div>
                  <br />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 col-12 col-sm-4">
                  <div className="form-group  text-left rounded-3">
                    <b>
                      <label htmlFor="expirydate">Expiry Date</label>
                    </b>
                    <input
                      type="date"
                      className="form-control"
                      id="expirydate"
                      value={formData.expirydate}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Select a date"
                    />
                  </div>
                </div>

                <div className="col-md-4 col-12 col-sm-4">
                  <div className="form-group  text-left rounded-3">
                    <b>
                      <label htmlFor="mrp">MRP</label>
                    </b>
                    <input
                      type="number"
                      className="form-control"
                      id="mrp"
                      value={formData.mrp}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      onInput={(e) => {
                        const numericValue = e.target.value.replace(
                          /[^0-9]/g,
                          ""
                        );
                        setFormData((prevData) => ({
                          ...prevData,
                          mrp: numericValue,
                        }));
                      }}
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                      }}
                    />
                  </div>
                </div>
              </div>
              <br />

              <div className="row">
                <div className="col-md-12 text-end">
                  <button
                    type="submit"
                    className="btn btn-sm me-2"
                    onClick={handleCancel}
                    style={{ backgroundColor: "teal", color: "white" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: "teal", color: "white" }}
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </form>
          <div
            className={`modal ${showPopup ? "show d-block" : ""}`}
            tabIndex="-1"
            role="dialog"
          >
            <div
              className="modal-header"
              style={{
                position: "fixed",
                top: "10px",
                left: "55%",
                transform: "translateX(-50%)",
                backgroundColor:
                  popupType === "error" || popupType === "emptyFields"
                    ? "red"
                    : "green",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                zIndex: "9999",
                display: "block",
              }}
            >
              <p>
                {popupType === "emptyFields"
                  ? "Please fill all input fields."
                  : popupType === "error"
                  ? popupMessage
                  : "Medicine added successfully."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddMedicine;
