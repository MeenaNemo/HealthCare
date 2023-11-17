import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { DatePicker } from 'antd';
import moment from 'moment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../styles/stock.css';

const StockDetailsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineData, setMedicineData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loader, setLoader] = useState(false);
  const itemsPerPage = 6;

  const fetchStockData = async () => {
    try {
      const response = await axios.get('/stock', {
        params: { medicinename: searchQuery }
      });

      setMedicineData(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Handle errors here
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [searchQuery]);
  
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
    const capture = document.querySelector('.stock-table');
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
      const imageWidth = 210; // A4 width in mm
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      doc.addImage(imgData, 'PNG', 0, 0, imageWidth, imageHeight);
      setLoader(false);
      doc.save('stock.pdf');
    });
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredData = medicineData.filter(item =>
    (item.medicinename && item.medicinename.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!fromDate || moment(item.purchasedate).isSameOrAfter(fromDate)) &&
    (!toDate || moment(item.purchasedate).isSameOrBefore(toDate))
  );
  const dataOnCurrentPage = filteredData.slice(startIndex, endIndex);

  return (
    <div>
      <div className='totalpage'>
        <div className="stock-details-header">
          <div className="left-top">
            <h2>Stock Details</h2>
            <br />
            <p>View your stock list</p>
            <div className="search-bar">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
              />
            </div>
          </div>
          <div className="right-top">
            <button>
              <FontAwesomeIcon icon={faFileExport} /> Export
            </button>
            <button onClick={downloadPDF} disabled={!(loader === false)}>
              {loader ? (<span>Downloading</span>) : (<span>Download</span>)}
            </button>
          </div>
          <div className='right-bottom' >
            <DatePicker onChange={handleFromDateChange} className="bold-placeholder" placeholder="From Date" />
            <DatePicker onChange={handleToDateChange} className="bold-placeholder" placeholder="To Date" />
          </div>
        </div>

        <div className="stock-table">

          {dataOnCurrentPage.length === 0 ? (
            <p>No search results found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Purchase Date</th>
                  <th>Product Name</th>
                  <th>Dosage</th>
                  <th>Brand Names</th>
                  <th>Buying price</th>
                  <th>Purchase Amount</th>
                  <th>Total Qty</th>
                </tr>
              </thead>
              <tbody>
                {dataOnCurrentPage.map((item) => (
                  <tr key={item.ID}>
                    <td>{item.purchasedate ? moment(item.purchasedate).format('YYYY-MM-DD') : 'N/A'}</td>
                    <td>{item.medicinename || 'N/A'}</td>
                    <td>{item.dosage || 'N/A'}</td>
                    <td>{item.brandname || 'N/A'}</td>
                    <td>{item.buyingprice || 'N/A'}</td>
                    <td>{item.purchaseamount || 'N/A'}</td>
                    <td>{item.totalqty || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}


        </div>

        <div className="pagination">
          <button onClick={handlePrevious} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}</span>
          <button onClick={handleNext} disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockDetailsPage;
