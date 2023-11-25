import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { DatePicker } from 'antd';
import moment from 'moment';
import html2canvas from 'html2canvas';
import exportToExcel from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../styles/stock.css';
import billbg from '../logo/ac.jpg'


const BillingHis = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineData, setMedicineData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [print, setPrint] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null); // State to store the fetched invoice data
  const captureRef = useRef(null);
  const itemsPerPage = 25;

  const filteredData = medicineData.filter(item =>
    (item.mobileno && item.mobileno.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!fromDate || moment(item.billingdate).isSameOrAfter(fromDate)) &&
    (!toDate || moment(item.billingdate).isSameOrBefore(toDate))
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const dataOnCurrentPage = filteredData.slice(startIndex, endIndex);

  const fetchbillingData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/billingdata');
      setMedicineData(response.data);

    } catch (error) {
      setError('Error fetching data');
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

  const downloadPDF = () => {
    const html2canvasOptions = {
      scale: 2,
      logging: false,
      allowTaint: true,
    };

    const capture = document.querySelector('.billing-table');
    setLoader(true);

    html2canvas(capture, html2canvasOptions).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const jsPDFOptions = {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      };

      const pdf = new jsPDF(jsPDFOptions);
      const imageWidth = 210; // A4 width in mm
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let rowIndex = 0;
      const numberOfRows = filteredData.length;

      let firstPage = true; // Flag to determine the first page

      while (rowIndex < numberOfRows) {
        if (!firstPage) {

          pdf.addPage();
          pdf.text(`Billing history from ${fromDate} to ${toDate}`); // Add page number
        }
        else {
          firstPage = false;
        }

        const currentPageData = filteredData.slice(rowIndex, rowIndex + itemsPerPage);
        const bodyData = currentPageData.map((currentData) => [
          currentData.tabletdetails || 'N/A',
          currentData.subtotal || 'N/A',
          currentData.discount || 'N/A',
          currentData.grandtotal || 'N/A',
          currentData.patientname || 'N/A',
          currentData.doctorname || 'N/A',
          currentData.mobileno || 'N/A',
          currentData.cashgiven || 'N/A',
          currentData.balance || 'N/A',
          currentData.invoice_number || 'N/A',
          currentData.createdate || 'N/A',
        ]);

        pdf.autoTable({
          head: [['Tablet Details', 'Subtotal', 'Discount', 'Grand Total', 'Patient Name', 'Doctor Name', 'Mobile Number', 'Cash Given', 'Balance', 'Invoice Number', 'Created Date']],
          body: bodyData,
          startY: 20,
          styles: {
            cellPadding: 2,
            fontSize: 10,
            lineColor: [0, 0, 0],
            lineWidth: 0.5,
            valign: 'middle',
            halign: 'center'
          },
          headStyles: {
            fillColor: [176, 196, 222],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          bodyStyles: {
            textColor: [0, 0, 0],
            lineWidth: 0.5,
            lineColor: [0, 0, 0]
          }
        });

        rowIndex += itemsPerPage;
      }

      setLoader(false);
      pdf.save('billing.pdf');
    });
  };

  const handlePrintByInvoice = async (invoiceNumber) => {
    try {
      // Fetch invoice data
      const response = await axios.get(`http://localhost:3000/billingdata/${invoiceNumber}`);
      const invoiceData = response.data;
      setInvoiceData(response.data);
      console.log("tablet", invoiceData)


      let medicineName = '';
      if (invoiceData[0].tabletdetails) {
        const tablets = JSON.parse(invoiceData[0].tabletdetails).tablets;
        if (tablets && tablets.length > 0) {
          medicineName = tablets[0].medicinename;
          console.log("name", medicineName)
        }
      }

      const capture = document.querySelector('.oldbill');
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

        // Add fetched invoiceData to the PDF
        doc.text(JSON.stringify(invoiceData), 10, 10); // Example: Add the data as text

        setLoader(false);
        setPrint(true);
        doc.save('oldbill.pdf');
      });
    } catch (error) {
      console.error('Error fetching or processing invoice data:', error);
    }
  };



  return (
    <div>
      <div style={{
        fontSize: '14px',
        fontFamily: 'serif',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}>
        <div className="d-flex align-items-center justify-content-between">
          <div style={{ margin: '20px' }}>
            <h2>
              <b>Billing History</b>
            </h2>

          </div>
          <div >
            <button onClick={exportToExcel}>
              <FontAwesomeIcon icon={faFileExport} /> Export
            </button>
            <button onClick={downloadPDF} disabled={!(loader === false)}>
              {loader ? (<span>Downloading</span>) : (<span>Download</span>)}
            </button>
          </div>
        </div>
        <br />
        <div className="d-flex align-items-center justify-content-between">

          <div className="search-bar" style={{ height: '30px', margin: '10px' }}>
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>
          <div className='right-bottom'  >
            From : <DatePicker onChange={handleFromDateChange} className="bold-placeholder" /> <span> </span>
            To : <DatePicker onChange={handleToDateChange} className="bold-placeholder" /> <span> </span>
          </div>

        </div>
        <div className="billing-table">
          {dataOnCurrentPage.length === 0 ? (
            <p>No search results found</p>
          ) : (
            <div>
              <table>
                <thead>
                  <tr>
                    <th class="text-center">Created Date</th>
                    <th class="text-center">Invoice Number</th>
                    <th class="text-center">Patient Name</th>
                    <th class="text-center">Mobile Number</th>
                    <th class="text-center">Grand Total</th>
                    <th class="text-center">Bill</th>
                  </tr>
                </thead>
                <tbody>
                  {dataOnCurrentPage.map((item) => (
                    <tr key={item.id}>
                      <td class="text-center">{item.createdate ? moment(item.createdate).format('YYYY-MM-DD') : 'N/A' || 'N/A'}</td>
                      <td class="text-center">{item.invoice_number || 'N/A'}</td>
                      <td class="text-center">{item.patientname || 'N/A'}</td>
                      <td class="text-center">{item.mobileno || 'N/A'}</td>
                      <td class="text-center">{item.grandtotal || 'N/A'}</td>
                      <td class="text-center"><button onClick={() => handlePrintByInvoice(item.invoice_number)}>Print</button></td>
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
          <span> {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}</span>
          <button onClick={handleNext} disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}>
            Next
          </button>
        </div>
      </div>

      <div>
         {
          invoiceData && (
            <div className="oldbill" style={{
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
              {/* Map over invoiceData if it's not null */}
              <div >
                <div style={{ marginLeft: '70%', marginTop: '110px', height: '70px', lineHeight: '2px' }}>
                  <div>
                    <h3 style={{ color: 'darkblue' }}><b>Invoice</b></h3>
                    <h6>Invoice No: {invoiceData[0].invoice_number}</h6>
                    <h6>Invoice Date: </h6>
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', marginTop: '5%' }}>
                <table style={{ width: '90%', margin: 'auto', borderCollapse: 'collapse' }}>
                  <thead >
                    <tr style={{ color: 'white' }}>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', backgroundColor: '#2A4577' }}>S.No</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', backgroundColor: '#2A4577' }}>Product Description</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', backgroundColor: '#2A4577' }}>Qty</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', backgroundColor: '#2A4577' }}>Price</th>
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', backgroundColor: '#2A4577' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.map((data, index) => {
                      // Parse the table details string into a JavaScript object
                      const tablets = JSON.parse(data.tabletdetails).tablets;

                      return (
                        <React.Fragment key={data.id}>
                          {tablets && tablets.length > 0 ? (
                            tablets.map((tablet, tabletIndex) => (
                              <tr key={`${data.id}-${tabletIndex}`} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{index * tablets.length + tabletIndex + 1}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{tablet.medicinename}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{tablet.qty}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{tablet.qtyprice}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{tablet.total}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No data available</td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>

                </table>

              </div>


              <div className="d-flex align-items-center justify-content-between ms-5" style={{ marginTop: '200px' }}>
                <div>
                  <div className="col-md-12 mt-3 text-start">
                    Cash Given: {invoiceData[0].cashgiven}
                  </div>
                  <div className="col-md-12 mt-3 text-start">
                    Balance: {invoiceData[0].balance}
                  </div>
                </div>
                <div style={{ marginRight: '40px' }}>
                  <div className="col-md-12 mt-3 text-end">
                    Subtotal: {invoiceData[0].subtotal}
                  </div>

                  <div className="col-md-12 mt-3 text-end">
                    Discount: <span>{invoiceData[0].discount}</span>
                  </div>

                  <div className="col-md-12 mt-3 text-end">
                    Grand Total: {invoiceData[0].grandtotal}
                  </div>
                </div>
              </div>

            </div>
          )
        }
      </div>
    </div>
  );
};

export default BillingHis;