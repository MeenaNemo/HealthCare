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

const Purchase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineData, setMedicineData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]);


  const itemsPerPage = 25;

  const filterData = () => {
    return medicineData.filter((item) => {
      console.log('fromDate:', fromDate);
    console.log('toDate:', toDate);
      const isSearched = item.medicinename.toLowerCase().includes(searchQuery.toLowerCase());
      const itemDate = moment(item.time).startOf('day');

      const isWithinDateRange =
        (!fromDate || itemDate.isSameOrAfter(moment(fromDate).startOf('day'))) &&
        (!toDate || itemDate.isSameOrBefore(moment(toDate).endOf('day')));
  
      return isSearched && isWithinDateRange;
                  
    });
  };

  useEffect(() => {
    fetchpurchaseData();
  }, [searchQuery, fromDate, toDate, medicineData]);
  
  useEffect(() => {
    const filtered = filterData();
    setFilteredData(filtered);
  }, [searchQuery, fromDate, toDate, medicineData]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const dataOnCurrentPage = filteredData.slice(startIndex, endIndex);

  const fetchpurchaseData = async () => {
    try {
      const response = await axios.get('/allpurchase', {
        params: { medicinename: searchQuery }
      });

      setMedicineData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching purchase data:', error);
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
    const fetchpurchaseData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/allpurchase');
        setMedicineData(response.data);

      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchpurchaseData();
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
    const worksheet = workbook.addWorksheet('PurchaseData');
  
    worksheet.columns = [
        { header: 'Medicine Name', key: 'medicinename', width: 15 },
        { header: 'Brand Names', key: 'brandname', width: 15 },
        { header: 'Dosage', key: 'dosage', width: 15 },
        { header: 'Purchase price', key: 'purchaseprice', width: 15 },
        { header: 'Total Qty', key: 'totalqty', width: 15 },
        { header: 'Purchase Amount', key: 'purchaseamount', width: 17 },
        { header: 'Expiry Date', key: 'expirydate', width: 15 },
        { header: 'MRP', key: 'mrp', width: 15 },
        { header: 'Purchase Date', key: 'time', width: 15 },
    ];
  
    const headerRow = worksheet.getRow(1);
  
    worksheet.columns.forEach((column) => {
      const cell = headerRow.getCell(column.key);
      if (['Medicine Name', 'Brand Name', 'Dosage', 'Purchase price', 'Total Qty', 'Purchase Amount', 'Expiry Date', 'MRP', 'Purchase Date'].includes(column.key)) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: 'FF0000FF', // Blue color
          },
        };
      }
      cell.font = {
        color: { argb: 'FFFFFF' }, // White text color
        bold: true,
      };
    });
  
    filteredData.forEach((item) => {
      const formattedDate = item.time ? moment(item.time).format('YYYY-MM-DD') : 'N/A';
  
      const dataRow = worksheet.addRow({
        medicinename: item.medicinename || 'N/A',
        brandname: item.brandname || 'N/A',
        dosage: item.dosage || 'N/A',
        purchaseprice: item.purchaseprice || 'N/A',
        totalqty: item.totalqty || 'N/A',
        purchaseamount: item.purchaseamount || 'N/A',
        expirydate: item.expirydate || 'N/A',
        mrp: item.mrp || 'N/A',
        purchasedate: formattedDate || 'N/A',

      });
  
      // Center-align data in each row
      dataRow.alignment = { horizontal: 'center' };
  
      // Add borders to each cell in the data row
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });
  
    // Add borders to all cells in the header row
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
  
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stock.xlsx';
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

    const capture = document.querySelector('.purchase-table');
    setLoader(true);

    const fromDate = moment(selectedFromDate).format('YYYY-MM-DD');
    const toDate = moment(selectedToDate).format('YYYY-MM-DD');

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
        } else {
          firstPage = false; // Update flag for subsequent pages
        }
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(43, 128, 176); // Blue color
        pdf.text(`Purchase Details from ${fromDate}  to  ${toDate}`, 10, 10, null, null, 'left');

        const headingHeight = 20; // Adjust this value based on the heading size and spacing
        const tableStartY = 0 + headingHeight; // Adjust the spacing between heading and table
        const currentPageData = filteredData.slice(rowIndex, rowIndex + itemsPerPage);
        const bodyData = currentPageData.map((currentData) => [
          currentData.medicinename || 'N/A',
          currentData.brandname || 'N/A',
          currentData.dosage || 'N/A',
          currentData.purchaseprice || 'N/A',
          currentData.totalqty || 'N/A',
          currentData.purchaseamount || 'N/A',
          currentData.expirydate ? moment(currentData.expirydate).format('YYYY-MM-DD') : 'N/A',
          currentData.mrp || 'N/A',
          currentData.time ? moment(currentData.time).format('YYYY-MM-DD') : 'N/A',
        ]);

        pdf.autoTable({
          head: [['Medicine Name', 'Brand Name', 'Dosage', 'Purchase Price', 'Total Qty', 'Purchase Amount', 'MRP',  'Expiry Date', 'Purchase Date']], body: bodyData,
          startY: tableStartY, // Adjust the starting Y position as needed
          theme: 'grid', // Apply grid theme for borders
          styles: {
            fontSize: 9,
            halign: 'center', // Center-align headings
          },
          headerStyles: {
            fillColor: [41, 128, 185], // Blue color for header background
            textColor: 255, // White text color
            lineWidth: 0.3, // Header border line width
          },
          columnStyles: {
            0: { cellWidth: 20, cellHeight: 10 }, // Adjust width and height for the Purchase Date column
            1: { cellWidth: 30, cellHeight: 10 }, // Adjust width and height for the Medicine Name column
            // Add more column styles as needed
          },
          alternateRowStyles: {
            fillColor: [224, 224, 224],
            lineWidth: 0.3// Alternate row background color
          },
        });

        rowIndex += itemsPerPage;
      }

      setLoader(false);
      pdf.save('purchase.pdf');
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
              <b> Purchase History</b>
            </h2>

          </div>
          <div >
            <button onClick={exportToExcel}>
              <FontAwesomeIcon icon={faFileExport} /> Export to Excel
            </button>
            <button onClick={downloadPDF} disabled={!(loader === false)}>
              {loader ? (<span>Downloading as PDF</span>) : (<span>Download as PDF</span>)}
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
        <div className="purchase-table">
          {dataOnCurrentPage.length === 0 ? (
            <p>No search results found</p>
          ) : (
            <div>
              <table>
                <thead>
                  <tr>
                   <th className='text-center'>Purchase Date</th>
                    <th className='text-center'>Medicine Name</th>
                    <th className='text-center'>Dosage</th>
                    <th className='text-center'>Brand Name</th>
                    <th className='text-center'>Purchase Price</th>
                    <th className='text-center'>Purchase Amount</th>
                    <th className='text-center'>MRP</th>
                    <th className='text-center'>Total Qty</th>
                    <th className='text-center'>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    dataOnCurrentPage.map((item) => (
                      <tr key={item.ID}>
                        <td className='text-center'>{item.time ? moment(item.time).format('YYYY-MM-DD') : 'N/A' || 'N/A'}</td>
                        <td className='text-center'>{item.medicinename || 'N/A'}</td>
                        <td className='text-center'>{item.dosage || 'N/A'}</td>
                        <td className='text-center'>{item.brandname || 'N/A'}</td>
                        <td className='text-center'>{item.purchaseprice || 'N/A'}</td>
                        <td className='text-center'>{item.purchaseamount || 'N/A'}</td>
                        <td className='text-center'>{item.mrp || 'N/A'}</td>
                        <td className='text-center'>{item.totalqty || 'N/A'}</td>
                        <td className='text-center'>{item.expirydate ? moment(item.expirydate).format('YYYY-MM-DD') : 'N/A'}</td>
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

export default Purchase;



