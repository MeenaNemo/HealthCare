import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import logoImage from "../logo/logo.jpg";
import profileImg from "../logo/profile.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faCashRegister,
  faPlus,
  faBoxes,
  faFileMedical,
  faStore,
  faMoneyBillTransfer,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import StockDetailsPage from "./stock";
import AddMedicine from "./addmedicine";
import Billing from "./billing";
import ConsultationForm from "./consultationform";
import Purchase from "./purchase";
import BillingHis from "./billinghistory";
import RegistrationForm from "./registration";
import StockDetailsPage1 from "./pharmacystock";
import { BiChevronUp, BiChevronDown } from "react-icons/bi";
import "bootstrap/dist/css/bootstrap.min.css";

const UserProfile = ({ user, onLogout }) => {
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem("user");
    history.push("/");
    window.location.reload();
    onLogout();
  };

  return (
    <div className="flex-grow-0" style={{ fontFamily: "serif, sans-serif" }}>
      <div className="d-flex align-items-center ">
        <img
          src={profileImg}
          alt="Profile"
          style={{
            width: "50px",
            height: "60px",
            marginRight: "5px",
            borderRadius: "50%",
            marginBottom: "15px",
          }}
        />
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ lineHeight: "2px" }}>
            <h6>
              <b> {user ? ` ${user.user.user_role} ` : "Guest"}</b>
            </h6>
            <h6>
              <b>
                {" "}
                {` ${user.user.user_first_name} ${user.user.user_last_name} `}
              </b>
            </h6>
            <p style={{ fontSize: "14px" }}>
              {user ? user.user.user_email : ""}
            </p>
          </div>
          <div style={{ marginTop: "-20px" }}>
            <button className="btn btn-icon" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [showStockDetails, setShowStockDetails] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showBillingHis, setShowBillingHis] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showStockDetails1, setShowStockDetails1] = useState(false);
  const history = useHistory();

  const handleRegistrationFormToggle = () => {
    if (user && user.user.user_role === "Doctor") {
      setShowRegistrationForm(true);
      setShowBilling(false);
      setShowStockDetails(false);
      setShowAddMedicine(false);
      setShowForm(false);
      setShowPurchase(false);
      setShowBillingHis(false);
    }
  };
  const handleStockDetailsToggle1 = () => {
    if (user && user.user.user_role === "Pharmacist") {
      setShowBilling(false);
      setShowStockDetails(false);
      setShowStockDetails1(true);
      setShowAddMedicine(false);
      setShowForm(false);
      setShowPurchase(false);
      setShowBillingHis(false);
      setShowRegistrationForm(false);
    }
  };

  const handleStockDetailsToggle = () => {
    if (
      (user && user.user.user_role === "Pharmacist") ||
      user.user.user_role === "Doctor"
    ) {
      setShowBilling(false);
      setShowStockDetails(true);
      setShowAddMedicine(false);
      setShowForm(false);
      setShowPurchase(false);
      setShowBillingHis(false);
      setShowRegistrationForm(false);
    }
  };

  const handleBillingToggle = () => {
    if (
      (user && user.user.user_role === "Pharmacist") ||
      user.user.user_role === "Doctor"
    ) {
      setShowBilling(true);
      setShowStockDetails(false);
      setShowStockDetails1(false);
      setShowAddMedicine(false);
      setShowForm(false);
      setShowPurchase(false);
      setShowBillingHis(false);
      setShowRegistrationForm(false);
    }
  };

  const handleAddMedicineToggle = () => {
    if (user && user.user.user_role === "Doctor") {
      setShowBilling(false);
      setShowStockDetails(false);
      setShowAddMedicine(true);
      setShowForm(false);
      setShowPurchase(false);
      setShowBillingHis(false);
      setShowRegistrationForm(false);
    }
  };

  const handleFormToggle = () => {
    if (user && user.user.user_role === "Doctor") {
      setShowBilling(false);
      setShowStockDetails(false);
      setShowAddMedicine(false);
      setShowForm(true);
      setShowPurchase(false);
      setShowBillingHis(false);
      setShowRegistrationForm(false);
    }
  };

  const handlePurchaseToggle = () => {
    if (user && user.user.user_role === "Doctor") {
      setShowBilling(false);
      setShowStockDetails(false);
      setShowAddMedicine(false);
      setShowForm(false);
      setShowPurchase(true);
      setShowBillingHis(false);
      setShowRegistrationForm(false);
    }
  };

  const handleBillingHisToggle = () => {
    if (user && user.user.user_role === "Doctor") {
      setShowBilling(false);
      setShowStockDetails(false);
      setShowAddMedicine(false);
      setShowForm(false);
      setShowPurchase(false);
      setShowBillingHis(true);
      setShowRegistrationForm(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setShowBilling(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    history.push("/");
    window.location.reload();
  };
  return (
    <div
      className="container-fluid"
      style={{ fontFamily: "serif, sans-serif" }}
    >
      <div className="row">
        <div className="col-lg-3 col-md-4">
          <div className="shadow-sm p-3  h-100 bg-white rounded">
            <div className="d-flex align-items-center mb-3">
              <img
                src={logoImage}
                alt="Profile"
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
              />
              <div>
                <h4 className="ms-0">
                  <b>ALAGAR CLINIC</b>
                </h4>
                <p className="mb-0" style={{ fontSize: "12px" }}>
                  Plot No-1, Fenner Colony, Virattipattu, Madurai-16.{" "}
                  <b>Contact:</b> 0452-4051228
                </p>
              </div>
            </div>

            <div className="col-12 ">
              <button
                className="btn text-dark w-100 mb-3 text "
                style={{ backgroundColor: "teal", color: "white" }}
                onClick={handleToggle}
                type="button"
                aria-expanded={isOpen}
              >
                <b style={{ color: "white" }}>MENU</b>{" "}
                {isOpen ? <BiChevronUp /> : <BiChevronDown />}
              </button>
              <div className={`collapse${isOpen ? " show" : ""} `}>
                <div className="d-flex justify-content-center font-size-14">
                  <ul
                    className="list-unstyled mb-3"
                    style={{ lineHeight: "21px" }}
                  >
                    {user &&
                      (user.user.user_role === "Pharmacist" ||
                        user.user.user_role === "Doctor") && (
                        <li className="mb-2">
                          <a
                            href="#"
                            className="text-decoration-none text-dark"
                            onClick={handleBillingToggle}
                          >
                            <FontAwesomeIcon
                              icon={faCashRegister}
                              className="me-3"
                            />
                            <b>Billing</b>
                          </a>
                        </li>
                      )}

                    {user && user.user.user_role === "Pharmacist" && (
                      <li className="mb-2">
                        <a
                          href="#"
                          className="text-decoration-none text-dark"
                          onClick={handleStockDetailsToggle1}
                        >
                          <FontAwesomeIcon icon={faBoxes} className="me-3" />{" "}
                          <b>Stock Details</b>
                        </a>
                      </li>
                    )}

                    <br />

                    {user && user.user.user_role === "Doctor" && (
                      <li className="mb-2">
                        <a
                          href="#"
                          className="text-decoration-none text-dark"
                          onClick={handleAddMedicineToggle}
                        >
                          <FontAwesomeIcon icon={faPlus} className="me-3" />
                          <b>Add Medicine</b>
                        </a>
                      </li>
                    )}

                    <br />

                    {user && user.user.user_role === "Doctor" && (
                      <li className="mb-2">
                        <a
                          href="#"
                          className="text-decoration-none text-dark"
                          onClick={handleFormToggle}
                        >
                          <FontAwesomeIcon
                            icon={faFileMedical}
                            className="me-3"
                          />
                          <b>Consultation Form</b>
                        </a>
                      </li>
                    )}

                    <br />

                    {user && user.user.user_role === "Doctor" && (
                      <li className="mb-2">
                        <a
                          href="#"
                          className="text-decoration-none text-dark"
                          onClick={handleStockDetailsToggle}
                        >
                          <FontAwesomeIcon icon={faBoxes} className="me-3" />
                          <b>Stock Details</b>
                        </a>
                      </li>
                    )}
                    <br />
                    {user && user.user.user_role === "Doctor" && (
                      <li className="mb-2">
                        <a
                          href="#"
                          className="text-decoration-none text-dark"
                          onClick={handlePurchaseToggle}
                        >
                          <FontAwesomeIcon icon={faStore} className="me-3" />
                          <b>Purchase History</b>
                        </a>
                      </li>
                    )}
                    <br />

                    {user && user.user.user_role === "Doctor" && (
                      <li className="mb-2">
                        <a
                          href="#"
                          className="text-decoration-none text-dark"
                          onClick={handleBillingHisToggle}
                        >
                          <FontAwesomeIcon
                            icon={faMoneyBillTransfer}
                            className="me-3"
                          />
                          <b>Billing History</b>
                        </a>
                      </li>
                    )}
                    <br />
                    {user && user.user.user_role === "Doctor" && (
                      <li className="mb-2">
                        <a
                          href="#"
                          className="text-decoration-none text-dark"
                          onClick={handleRegistrationFormToggle}
                        >
                          <FontAwesomeIcon icon={faIdCard} className="me-3" />
                          <b>Registration Form</b>
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
                <hr />
                <div>
                  {user && <UserProfile user={user} onLogout={handleLogout} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-9 col-md-8 col-12">
          <div className="row">
            <div className="col">
              <div
                className="stock-details-content"
                style={{ display: showStockDetails ? "block" : "none" }}
              >
                {showStockDetails && (
                  <div className="stock-details-content">
                    <StockDetailsPage />
                  </div>
                )}
              </div>

              <div
                className="stock-details-content"
                style={{ display: showStockDetails1 ? "block" : "none" }}
              >
                {showStockDetails1 && (
                  <div className="stock-details-content">
                    <StockDetailsPage1 />
                  </div>
                )}
              </div>

              <div
                className="billing-content"
                style={{
                  display: showBilling ? "block" : "none",
                  marginLeft: "0px",
                }}
              >
                {showBilling && (
                  <div className="billing-content">
                    <Billing />
                  </div>
                )}
              </div>

              <div
                className="stock-details-content"
                style={{ display: showAddMedicine ? "block" : "none" }}
              >
                {showAddMedicine && (
                  <div className="stock-details-content">
                    <AddMedicine />
                  </div>
                )}
              </div>

              <div
                className="stock-details-content"
                style={{ display: showForm ? "block" : "none" }}
              >
                {showForm && (
                  <div className="stock-details-content">
                    <ConsultationForm />
                  </div>
                )}
              </div>

              <div
                className="stock-details-content"
                style={{ display: showPurchase ? "block" : "none" }}
              >
                {showPurchase && (
                  <div className="stock-details-content">
                    <Purchase />
                  </div>
                )}
              </div>

              <div
                className="stock-details-content"
                style={{ display: showBillingHis ? "block" : "none" }}
              >
                {showBillingHis && (
                  <div className="stock-details-content">
                    <BillingHis />
                  </div>
                )}
              </div>

              <div
                className="registration-form-content"
                style={{ display: showRegistrationForm ? "block" : "none" }}
              >
                {showRegistrationForm && (
                  <div className="registration-form-content">
                    <RegistrationForm />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
