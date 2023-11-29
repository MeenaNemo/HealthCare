import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { DatePicker } from "antd";
import moment from "moment";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../styles/stock.css";
import billbg from "../logo/ac.jpg";

const BillingHis = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [medicineData, setMedicineData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isViewed, setisViewed] = useState(false);
  const [invoiceData, setInvoiceData] = useState("");
  const itemsPerPage = 25;
  const [loader, setLoader] = useState(false);

  const filteredData = medicineData.filter((item) =>
    (item.mobileno && item.mobileno.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!fromDate || moment(item.createdate).startOf('day').isSameOrAfter(moment(fromDate).startOf('day'))) &&
    (!toDate || moment(item.createdate).endOf('day').isSameOrBefore(moment(toDate).endOf('day')))
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const dataOnCurrentPage = filteredData.slice(startIndex, endIndex);

  const fetchbillingData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/billingdata");
      setMedicineData(response.data);
    } catch (error) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchbillingData();
  }, [searchQuery]);

  useEffect(() => {
    fetchbillingData();
  }, []);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    const totalPages = Math.ceil(medicineData.length / itemsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleFromDateChange = (date, dateString) => {
    setFromDate(dateString);
  };

  const handleToDateChange = (date, dateString) => {
    setToDate(dateString);
  };

  const View = async (invoiceNumber) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/billingdata/${invoiceNumber}`
      );
      const invoiceData = response.data;
      setInvoiceData(invoiceData);
      setisViewed(true);
    } catch (error) {
      console.error("Error fetching or processing invoice data:", error);
    }
  };

  const downloadPDF = () => {
    setLoader(true);

    const html2canvasOptions = {
      scale: 2,
      logging: false,
      allowTaint: true,
    };

    const capture = document.querySelector(".oldbill");

    html2canvas(capture, html2canvasOptions).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const jsPDFOptions = {
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      };

      const doc = new jsPDF(jsPDFOptions);
      const imageWidth = 210;
      const imageHeight = 300;

      doc.addImage(imgData, "PNG", 0, 0, imageWidth, imageHeight);

      const invoiceNumber = invoiceData[0].invoice_number;
      const fileName = `invoice_${invoiceNumber}.pdf`;

      doc.save(fileName);
      setLoader(false);
    });
  };
  const handlecancel=(event)=>{
    event.preventDefault();
    setisViewed(false);
  }

  return (
    <>
      <div>
        {!isViewed ? (
          <div
            style={{
              fontSize: "14px",
              fontFamily: "serif",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="container-fluid p-3" style={{ fontFamily: "serif" }}>
  <div className="row align-items-center">
    <div className="col-12">
      <h2><b>Billing History</b></h2>
    </div>
  </div>
  <div className="row align-items-center mt-3">
    <div className="col-12 col-md-6">
      <div className="search-bar d-flex align-items-center">
        <FontAwesomeIcon icon={faSearch} />
        <input
          type="text"
          placeholder="Search Mobile number..."
          value={searchQuery}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="ms-2"
        />
      </div>
    </div>
    <div className="col-12 col-md-6 mt-3 mt-md-0 d-flex justify-content-md-end">
      <span className="bold-placeholder me-3">
        From: <DatePicker onChange={handleFromDateChange} />
      </span>
      <span className="bold-placeholder">
        To: <DatePicker onChange={handleToDateChange} />
      </span>
    </div>
  </div>
</div>

            
            <div className="billing-table">
              {dataOnCurrentPage.length === 0 ? (
                <p>No search results found</p>
              ) : (
                <div className="scrollable-body">
                <table className="table">
                <thead className="sticky-top" style={{ backgroundColor: 'blue', borderBottom: '2px solid black' }}>
                      <tr>
                        <th className="text-center">Created Date</th>
                        <th className="text-center">Invoice Number</th>
                        <th className="text-center">Patient Name</th>
                        <th className="text-center">Mobile Number</th>
                        <th className="text-center">Grand Total</th>
                        <th className="text-center">Bill</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataOnCurrentPage.map((item) => (
                        <tr key={item.id}>
                          <td className="text-center">
                            {item.createdate
                              ? moment(item.createdate).format("YYYY-MM-DD")
                              : "N/A" || "N/A"}
                          </td>
                          <td className="text-center">
                            {item.invoice_number || "N/A"}
                          </td>
                          <td className="text-center">
                            {item.patientname || "N/A"}
                          </td>
                          <td className="text-center">
                            {item.mobileno || "N/A"}
                          </td>
                          <td className="text-center">
                            {item.grandtotal || "N/A"}
                          </td>
                          <td className="text-center" style={{padding:'5px'}}>
                            <button  className="export" onClick={() => View(item.invoice_number)} style={{padding:'4px'}}>
                              {" "}
                              View{" "}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pagination">
              <button onClick={handlePrevious} disabled={currentPage === 1}>
                Previous
              </button>
              <span>
                {" "}
                {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}
              </span>
              <button
                onClick={handleNext}
                disabled={
                  currentPage === Math.ceil(filteredData.length / itemsPerPage)
                }
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          invoiceData && (
            <div className="mt-2 container">
    <div className="row">
      <div className="col-lg-8 col-md-10 col-sm-12 mx-auto">
        <div>
          <div className="text-end">
            <button
              type="button"
              className="btn btn-success me-2"
              onClick={downloadPDF}
              disabled={!(loader === false)}
            >
              Download as PDF
            </button>
            <button
              type="button"
              className="btn btn-success me-2"
              onClick={handlecancel}
            >
              Go to Previous Page
            </button>
          </div>
          <div
            className="oldbill p-4 bg-white border border-dark mt-3"
            style={{
              backgroundImage: `url(${billbg})`,
              backgroundSize: "100% 100%",
              fontFamily: "serif",
            }}
          >
            <div className="mt-5">
              <div className="d-flex justify-content-end">
                <div className="mt-5">
                  <div>
                    <h3 style={{ color: "darkblue" }}>
                      <b>Invoice</b>
                    </h3>
                    <h6>Invoice No: {invoiceData[0].invoice_number}</h6>
                    <h6>
                      Invoice Date:{" "}
                      {invoiceData[0].createdate
                        ? moment(invoiceData[0].createdate).format("YYYY-MM-DD")
                        : "N/A" || "N/A"}
                    </h6>
                    <h6>Patient Name: {invoiceData[0].patientname}</h6>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-100 mx-auto mt-5 table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table table-bordered">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="p-3 text-center border-bottom">S.No</th>
                    <th className="p-3 text-center border-bottom">
                      Medicine Name
                    </th>
                    <th className="p-3 text-center border-bottom">Qty</th>
                    <th className="p-3 text-center border-bottom">Price</th>
                    <th className="p-3 text-center border-bottom">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.map((data, index) => {
                    const tablets = JSON.parse(data.tabletdetails).tablets;

                    return (
                      <React.Fragment key={data.id}>
                        {tablets && tablets.length > 0 ? (
                          tablets.map((tablet, tabletIndex) => (
                            <tr
                              key={`${data.id}-${tabletIndex}`}
                              className="border-bottom"
                            >
                              <td className="p-3 text-center">
                                {index * tablets.length + tabletIndex + 1}
                              </td>
                              <td className="p-3 text-center">
                                {tablet.medicinename}
                              </td>
                              <td className="p-3 text-center">
                                {tablet.qty}
                              </td>
                              <td className="p-3 text-center">
                                {tablet.qtyprice}
                              </td>
                              <td className="p-3 text-center">
                                {tablet.total}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="p-3 text-center"
                              colSpan="5"
                            >
                              No data available
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="d-flex align-items-center justify-content-between ms-5 mt-5">
              <div>
                <div className="mt-3 text-start">
                  Cash Given: {invoiceData[0].cashgiven}
                </div>
                <div className="mt-3 text-start">
                  Balance: {invoiceData[0].balance}
                </div>
              </div>
              <div style={{ marginRight: "40px" }}>
                <div className="mt-3 text-end">
                  Subtotal: {invoiceData[0].subtotal}
                </div>
                <div className="mt-3 text-end">
                  Discount: <span>{invoiceData[0].discount}</span>
                </div>
                <div className="mt-3 text-end">
                  Grand Total: {invoiceData[0].grandtotal}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
          
          )
        )}
        ;
      </div>
    </>
  );
};

export default BillingHis;
