import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { DatePicker } from 'antd';
import moment from 'moment';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../styles/stock.css'

const BillingHis = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineData, setMedicineData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const response = await axios.get('/billingdata', {
        params: { mobileno: searchQuery }
      });

      setMedicineData(response.data);

    } catch (error) {
      console.error('Error fetching billing data:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Request error:', error.message);
      }
    };
  };

  useEffect(() => {
    fetchbillingData();
  }, [searchQuery]);

  useEffect(() => {
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

  const exportToExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('billingData');

    worksheet.columns = [
      { header: 'Tablet Details', key: 'tabletdetails', width: 15 },
      { header: 'Grand Total', key: 'grandtotal', width: 15 },
      { header: 'Patient Name', key: 'patientname', width: 17 },
      { header: 'Doctor Name', key: 'doctorname', width: 15 },
      { header: 'Mobile Number', key: 'mobileno', width: 15 },
      { header: 'Cash Given', key: 'cashgiven', width: 15 },
      { header: 'Invoice Number', key: 'invoice_number', width: 15 },
      { header: 'Date', key: 'createdate', width: 15 },
    ];

    worksheet.getRow(1).alignment = { horizontal: 'center' };
    worksheet.getRow(1).font = { bold: true };

    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      align: 'center',
      fgColor: {
        argb: 'FFADD8E6'
      },
    };

    filteredData.forEach((item) => {
      const formattedDate = item.createdate ? moment(item.time).format('YYYY-MM-DD') : 'N/A';
      worksheet.addRow({
        tabletdetails: item.tabletdetails || 'N/A',
        subtotal: item.subtotal || 'N/A',
        discount: item.discount || 'N/A',
        grandtotal: item.grandtotal || 'N/A',
        patientname: item.patientname || 'N/A',
        doctorname: item.doctorname || 'N/A',
        mobileno: item.mobileno || 'N/A',
        cashgiven: item.cashgiven || 'N/A',
        balance: item.balance || 'N/A',
        invoice_number: item.invoice_number || 'N/A',
        createdate: formattedDate || 'N/A',

      });
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'billing.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
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
              <b> BILLING DETAILS</b>
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
                  <th>Created Date</th>
                  <th>Invoice Number</th>
                  <th>Patient Name</th>
                  <th>Mobile Number</th>
                  <th>Grand Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dataOnCurrentPage.map((item) => (
                    <tr key={item.id}>
                      <td>{item.createdate ? moment(item.createdate).format('YYYY-MM-DD') : 'N/A' || 'N/A'}</td>
                      <td>{item.invoice_number || 'N/A'}</td>
                      <td>{item.patientname || 'N/A'}</td>
                      <td>{item.mobileno || 'N/A'}</td>
                      <td>{item.grandtotal || 'N/A'}</td>
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
    </div>
  );
};

export default BillingHis;