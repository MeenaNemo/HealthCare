import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { DatePicker } from "antd";
import moment from "moment";
import html2canvas from "html2canvas";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../styles/stock.css";

const Purchase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [medicineData, setMedicineData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  const itemsPerPage = 25;
  
  const filterData = () => {
    return medicineData.filter((item) => {
      const isSearched = item.medicinename
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const itemDate = moment(item.time).startOf("day");

      const isWithinDateRange =
        (!fromDate ||
          itemDate.isSameOrAfter(moment(fromDate).startOf("day"))) &&
        (!toDate || itemDate.isSameOrBefore(moment(toDate).endOf("day")));

      return isSearched && isWithinDateRange;
    });
  };

  useEffect(() => {
    fetchpurchaseData();
  }, [searchQuery, fromDate, toDate]);

  useEffect(() => {
    const filtered = filterData();
    setFilteredData(filtered);
  }, [searchQuery, fromDate, toDate, medicineData]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const dataOnCurrentPage = filteredData.slice(startIndex, endIndex);

  const fetchpurchaseData = async () => {
    try {
      const response = await axios.get("https://api.5ytechno.com/allpurchase", {
        params: { medicinename: searchQuery },
      });

      setMedicineData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching purchase data:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request error:", error.message);
      }
    }
  };

  useEffect(() => {
    const fetchpurchaseData = async () => {
      try {
        const response = await axios.get(
          "https://api.5ytechno.com/allpurchase"
        );
        setMedicineData(response.data);
      } catch (error) {
        setError("Error fetching data");
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
    const worksheet = workbook.addWorksheet("PurchaseData");

    const columns = [
      "Purchase Date",
      "Medicine Name",
      "Dosage",
      "Brand Name",
      "Purchase Price",
      "Purchase Amount",
      "MRP",
      "Total Qty",
      "Expiry Date",
    ];

    worksheet.columns = columns.map((column, index) => ({
      header: column,
      key: column.toLowerCase().replace(/\s/g, ""),
      width: index === 0 ? 17 : 15,
    }));

    const headerRow = worksheet.getRow(1);

    worksheet.columns.forEach((column) => {
      const cell = headerRow.getCell(column.key);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FF001F3F",
        },
      };
      cell.font = {
        color: { argb: "FFFFFF" },
        bold: true,
      };
      cell.alignment = { horizontal: "center" };
    });

    filteredData.forEach((item) => {
      const formattedDate = item.time
        ? moment(item.time).format("YYYY-MM-DD")
        : "N/A";

      const dataRow = worksheet.addRow({
        purchasedate: formattedDate || "N/A",
        medicinename: item.medicinename || "N/A",
        dosage: item.dosage || "N/A",
        brandname: item.brandname || "N/A",
        purchaseprice: item.purchaseprice || "N/A",
        purchaseamount: item.purchaseamount || "N/A",
        mrp: item.mrp || "N/A",
        totalqty: item.totalqty || "N/A",
        expirydate: item.expirydate
          ? moment(item.expirydate).format("YYYY-MM-DD")
          : "N/A",
      });

      dataRow.eachCell((cell) => {
        cell.alignment = { horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "purchase_history.xlsx";
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

    const capture = document.querySelector(".purchase-table");
    setLoader(true);

    const formattedFromDate = fromDate
      ? moment(fromDate).format("YYYY-MM-DD")
      : "N/A";

    const formattedToDate = toDate
      ? moment(toDate).format("YYYY-MM-DD")
      : "N/A";

    html2canvas(capture, html2canvasOptions).then((canvas) => {
      const jsPDFOptions = {
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      };

      const pdf = new jsPDF(jsPDFOptions);
      const imageWidth = 210;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(43, 128, 176);

      const headingText =
        fromDate && toDate
          ? `Purchase Details from ${formattedFromDate} to ${formattedToDate}`
          : "Purchase Details as on Today";

      pdf.text(headingText, 10, 10, null, null, "left");

      const headingHeight = 20;
      const tableStartY = 0 + headingHeight;
      const firstPageData = filteredData.slice(0, itemsPerPage);
      const firstPageBodyData = firstPageData.map((currentData) => [
        currentData.time
          ? moment(currentData.time).format("YYYY-MM-DD")
          : "N/A",
        currentData.medicinename || "N/A",
        currentData.dosage || "N/A",
        currentData.brandname || "N/A",
        currentData.purchaseprice || "N/A",
        currentData.purchaseamount || "N/A",
        currentData.mrp || "N/A",
        currentData.totalqty || "N/A",
        currentData.expirydate
          ? moment(currentData.expirydate).format("YYYY-MM-DD")
          : "N/A",
      ]);

      pdf.autoTable({
        head: [
          [
            "Purchase Date",
            "Medicine Name",
            "Dosage",
            "Brand Name",
            "Purchase Price",
            "Purchase Amount",
            "MRP",
            "Total Qty",
            "Expiry Date",
          ],
        ],
        body: firstPageBodyData,
        startY: tableStartY,
        theme: "grid",
        styles: {
          fontSize: 9,
          halign: "center",
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          lineWidth: 0.3,
        },
        columnStyles: {
          0: { cellWidth: 20, cellHeight: 10 },
          1: { cellWidth: 30, cellHeight: 10 },
        },
        alternateRowStyles: {
          fillColor: [224, 224, 224],
          lineWidth: 0.3,
        },
      });

      let rowIndex = itemsPerPage;
      const numberOfRows = filteredData.length;

      while (rowIndex < numberOfRows) {
        pdf.addPage();
        pdf.text(`Page ${Math.ceil((rowIndex + 1) / itemsPerPage)}`, 10, 10);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(43, 128, 176);

        const currentPageData = filteredData.slice(
          rowIndex,
          rowIndex + itemsPerPage
        );
        const bodyData = currentPageData.map((currentData) => [
          currentData.medicinename || "N/A",
          currentData.brandname || "N/A",
          currentData.dosage || "N/A",
          currentData.purchaseprice || "N/A",
          currentData.totalqty || "N/A",
          currentData.purchaseamount || "N/A",
          currentData.expirydate
            ? moment(currentData.expirydate).format("YYYY-MM-DD")
            : "N/A",
          currentData.mrp || "N/A",
          currentData.time
            ? moment(currentData.time).format("YYYY-MM-DD")
            : "N/A",
        ]);

        pdf.autoTable({
          head: [
            [
              "Medicine Name",
              "Brand Name",
              "Dosage",
              "Purchase Price",
              "Total Qty",
              "Purchase Amount",
              "MRP",
              "Expiry Date",
              "Purchase Date",
            ],
          ],
          body: bodyData,
          startY: tableStartY,
          theme: "grid",
          styles: {
            fontSize: 9,
            halign: "center",
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            lineWidth: 0.3,
          },
          columnStyles: {
            0: { cellWidth: 20, cellHeight: 10 },
            1: { cellWidth: 30, cellHeight: 10 },
          },
          alternateRowStyles: {
            fillColor: [224, 224, 224],
            lineWidth: 0.3,
          },
        });

        rowIndex += itemsPerPage;
      }

      setLoader(false);
      pdf.save("purchase.pdf");
    });
  };

  return (
    <div>
      <div
        style={{
          fontSize: "14px",
          fontFamily: "serif, sans-serif",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="container-fluid p-3"
          style={{ fontFamily: "serif, sans-serif" }}
        >
          <div className="row align-items-center">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-0">
                    <b>Purchase History</b>
                  </h2>
                </div>
                <div className="text-end">
                  <button className="export me-2" onClick={exportToExcel}>
                    Export to Excel
                  </button>
                  <button
                    className="export"
                    onClick={downloadPDF}
                    disabled={loader}
                  >
                    {loader ? (
                      <span>Downloading as PDF</span>
                    ) : (
                      <span>Download as PDF</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row align-items-center mt-3">
            <div className="col-12 col-md-8">
              <div
                className="search-bar d-flex align-items-center"
                style={{ marginLeft: "-0px" }}
              >
                <FontAwesomeIcon icon={faSearch} />
                <input
                  type="text"
                  placeholder="Search Medicine name..."
                  value={searchQuery}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  style={{ height: "30px" }}
                />
              </div>
            </div>
            <div className="col-12 col-md-12 mt-3 mt-md-0 d-flex justify-content-md-end">
              <span className="bold-placeholder me-3">
                From: <DatePicker onChange={handleFromDateChange} />
              </span>
              <span className="bold-placeholder">
                To: <DatePicker onChange={handleToDateChange} />
              </span>
            </div>
          </div>
        </div>

        <div className="purchase-table ms-4">
          {dataOnCurrentPage.length === 0 ? (
            <p>No search results found</p>
          ) : (
            <div className="scrollable-body ">
              <table className="table">
                <thead className="sticky-top bg-light">
                  <tr >
                    <th className="text-center">Purchase Date</th>
                    <th className="text-center">Medicine Name</th>
                    <th className="text-center">Dosage</th>
                    <th className="text-center">Brand Name</th>
                    <th className="text-center">Purchase Price</th>
                    <th className="text-center">Purchase Amount</th>
                    <th className="text-center">MRP</th>
                    <th className="text-center">Total Qty</th>
                    <th className="text-center">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dataOnCurrentPage.map((item, index) => (
                    <tr key={item.ID || index}>
                      <td className="text-center">
                        {item.time
                          ? moment(item.time).format("YYYY-MM-DD")
                          : "N/A" || "N/A"}
                      </td>
                      <td className="text-start">
                        {item.medicinename || "N/A"}
                      </td>
                      <td className="text-center">{item.dosage || "N/A"}</td>
                      <td className="text-center">{item.brandname || "N/A"}</td>
                      <td className="text-center">
                        {item.purchaseprice || "N/A"}
                      </td>
                      <td className="text-center">
                        {item.purchaseamount || "N/A"}
                      </td>
                      <td className="text-center">{item.mrp || "N/A"}</td>
                      <td className="text-center">{item.totalqty || "N/A"}</td>
                      <td className="text-center">
                        {item.expirydate
                          ? moment(item.expirydate).format("YYYY-MM-DD")
                          : "N/A"}
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
    </div>
  );
};

export default Purchase;
