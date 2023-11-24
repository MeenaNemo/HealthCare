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

const StockDetailsPage = () => {
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
    (item.medicinename && item.medicinename.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!fromDate || moment(item.purchasedate).isSameOrAfter(fromDate)) &&
    (!toDate || moment(item.purchasedate).isSameOrBefore(toDate))
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const dataOnCurrentPage = filteredData.slice(startIndex, endIndex);

  const fetchStockData = async () => {
    try {
      const response = await axios.get('/stock', {
        params: { medicinename: searchQuery }
      });

      setMedicineData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
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
    fetchStockData();
  }, [searchQuery]);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/stock');
        setMedicineData(response.data);

      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchStockData();
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
    const worksheet = workbook.addWorksheet('StockData');

    worksheet.columns = [
      { header: 'Purchase Date', key: 'purchasedate', width: 15 },
      { header: 'Product Name', key: 'medicinename', width: 15 },
      { header: 'Dosage', key: 'dosage', width: 15 },
      { header: 'Brand Names', key: 'brandname', width: 15 },
      { header: 'purchase price', key: 'purchaseprice', width: 15 },
      { header: 'Purchase Amount', key: 'purchaseamount', width: 17 },
      { header: 'MRP', key: 'mrp', width: 15 },
      { header: 'Total Qty', key: 'totalqty', width: 15 },
    ];
    worksheet.getRow(1).alignment = { horizontal: 'center' };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      align: 'center',
      fgColor: {
        argb: 'FF00FF00'
      },
    };

    filteredData.forEach((item) => {
      const formattedDate = item.purchasedate
        ? moment(item.purchasedate).format('YYYY-MM-DD')
        : 'N/A';

      worksheet.addRow({
        purchasedate: formattedDate,
        medicinename: item.medicinename || 'N/A',
        dosage: item.dosage || 'N/A',
        brandname: item.brandname || 'N/A',
        purchaseprice: item.purchaseprice || 'N/A',
        purchaseamount: item.purchaseamount || 'N/A',
        mrp: item.mrp || 'N/A',
        totalqty: item.totalqty || 'N/A',
      });
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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

    const capture = document.querySelector('.stock-table');
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
          pdf.text(`Page ${Math.ceil((rowIndex + 1) / itemsPerPage)}`, 10, 10); // Add page number
        }
        else {
          firstPage = false; // Update flag for subsequent pages
        }

        const currentPageData = filteredData.slice(rowIndex, rowIndex + itemsPerPage);
        const bodyData = currentPageData.map((currentData) => [
          currentData.purchasedate ? moment(currentData.purchasedate).format('YYYY-MM-DD') : 'N/A',
          currentData.medicinename || 'N/A',
          currentData.dosage || 'N/A',
          currentData.brandname || 'N/A',
          currentData.purchaseprice || 'N/A',
          currentData.purchaseamount || 'N/A',
          currentData.mrp || 'N/A',
          currentData.totalqty || 'N/A',
          currentData.expirydate ? moment(currentData.expirydate).format('YYYY-MM-DD') : 'N/A',
        ]);

        pdf.autoTable({
          head: [['Purchase Date', 'Medicine Name', 'Dosage', 'Brand Name', 'Purchase Price', 'Purchase Amount', 'MRP', 'Total Qty', 'Expiry Date']],
          body: bodyData,
          startY: 20, // Adjust the starting Y position as needed
        });

        rowIndex += itemsPerPage;
      }

      setLoader(false);
      pdf.save('stock.pdf');
    });
  };

  return (
    <div>
      <div style={{
        fontFamily: 'serif',
        
      }}>
        <div className="d-flex align-items-center justify-content-between">
          <div style={{ marginLeft: '20px' }}>
            <h2>
              <b> STOCK DETAILS</b>
            </h2>
            <h6 style={{ textAlign: 'center' }}>

              View your stock list</h6>
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

          <div className="search-bar" style={{ height: '50px' }}>
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>
          <div className='right-bottom'  >
            <DatePicker onChange={handleFromDateChange} className="bold-placeholder" placeholder="From Date" />
            <DatePicker onChange={handleToDateChange} className="bold-placeholder" placeholder="To Date" />
          </div>

        </div>
        <div className="stock-table">
          {dataOnCurrentPage.length === 0 ? (
            <p>No search results found</p>
          ) : (
            <div>
              <h2 style={{marginLeft:'10px'}}>Stock details</h2>
              <table>
                <thead>
                  <tr>
                    <th>Purchase Date</th>
                    <th>Product Name</th>
                    <th>Dosage</th>
                    <th>Brand Name</th>
                    <th>Purchase Price</th>
                    <th>Purchase Amount</th>
                    <th>MRP</th>
                    <th>Total Qty</th>
                    <th>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dataOnCurrentPage.map((item) => (
                    <tr key={item.ID}>
                      <td>{item.purchasedate ? moment(item.purchasedate).format('YYYY-MM-DD') : 'N/A'}</td>
                      <td>{item.medicinename || 'N/A'}</td>
                      <td>{item.dosage || 'N/A'}</td>
                      <td>{item.brandname || 'N/A'}</td>
                      <td>{item.purchaseprice || 'N/A'}</td>
                      <td>{item.purchaseamount || 'N/A'}</td>
                      <td>{item.mrp || 'N/A'}</td>
                      <td>{item.totalqty || 'N/A'}</td>
                      <td>{item.expirydate ? moment(item.expirydate).format('YYYY-MM-DD') : 'N/A'}</td>
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

export default StockDetailsPage;
