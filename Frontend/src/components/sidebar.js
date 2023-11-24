import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import logoImage from '../logo/logo.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faCashRegister, faPlus, faBoxes, faFileMedical } from '@fortawesome/free-solid-svg-icons';
import StockDetailsPage from './stock';
import AddMedicine from './addmedicine';
import Billing from './billing';
import ConsultationForm from './consultationform';
import Purchase from './purchase';
import BillingHis from './billinghistory';
import { BiChevronUp, BiChevronDown } from 'react-icons/bi';

const UserProfile = ({ user, onLogout }) => {
    const history = useHistory();

    const handleLogout = () => {
        localStorage.removeItem('user');
        history.push('/');
        window.location.reload();
        onLogout();
    };

    return (
        <div className="flex-grow-0" style={{ fontFamily: 'serif' }}>
            <div className="d-flex align-items-center ">
                {user && user.user.user_profile_photo && (
                    <img
                        src={user.user.user_profile_photo}
                        alt="Profile"
                        style={{ width: '50px', height: '60px', marginRight: '5px', borderRadius: '50%', marginBottom: '15px' }}
                    />
                )}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ lineHeight: '2px' }}>
                        <h6>
                            <b> {user ? ` ${user.user.user_role} ` : 'Guest'}</b>
                        </h6>
                        <h6>
                            <b> {` ${user.user.user_first_name} ${user.user.user_last_name} `}</b>
                        </h6>
                        <p style={{ fontSize: '14px' }}>{user ? user.user.user_email : ''}</p>
                    </div>
                    <div style={{ marginTop: '-20px' }}>
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
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [showStockDetails, setShowStockDetails] = useState(false);
    const [showBilling, setShowBilling] = useState(false);
    const [showAddMedicine, setShowAddMedicine] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showPurchase, setShowPurchase] = useState(false);
    const [showBillingHis, setShowBillingHis] = useState(false);

    const handleStockDetailsToggle = () => {
        if (user && user.user.user_role === 'Admin') {
            setShowBilling(false);
            setShowStockDetails(!showStockDetails);
            setShowAddMedicine(false);
            setShowForm(false);
            setShowPurchase(false);
            setShowBillingHis(false);
        }
    };

    const handleBillingToggle = () => {
        if (user && user.user.user_role === 'staff' || user.user.user_role === 'Admin') {
            setShowBilling(!showBilling);
            setShowStockDetails(false);
            setShowAddMedicine(false);
            setShowForm(false);
            setShowPurchase(false);
            setShowBillingHis(false);
        }
    };

    const handleAddMedicineToggle = () => {
        if (user && user.user.user_role === 'Admin') {
            setShowBilling(false);
            setShowStockDetails(false);
            setShowAddMedicine(!showAddMedicine);
            setShowForm(false);
            setShowPurchase(false);
            setShowBillingHis(false);
        }
    };

    const handleFormToggle = () => {
        if (user && user.user.user_role === 'Admin') {
            setShowBilling(false);
            setShowStockDetails(false);
            setShowAddMedicine(false);
            setShowForm(!showForm);
            setShowPurchase(false);
            setShowBillingHis(false);
        }
    };

    const handlePurchaseToggle = () => {
        if (user && user.user.user_role === 'Admin') {
            setShowBilling(false);
            setShowStockDetails(false);
            setShowAddMedicine(false);
            setShowForm(false);
            setShowPurchase(!showPurchase);
            setShowBillingHis(false);
        }
    };

    const handleBillingHisToggle = () => {
        if (user && user.user.user_role === 'Admin') {
            setShowBilling(false);
            setShowStockDetails(false);
            setShowAddMedicine(false);
            setShowForm(false);
            setShowPurchase(false);
            setShowBillingHis(!showBillingHis);
        }
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);


            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    const history = useHistory();

    const handleLogout = () => {
        localStorage.removeItem('user');
        history.push('/');
        window.location.reload();
    };

    return (
        <div className="d-flex justify-content-between"  >
            <div className=' shadow-sm p-3 bg-white rounded '
                style={{
                    height: '100vh',
                    fontFamily: 'serif',
                }}
            >
                <div className="d-flex align-items-center" style={{ height: '50px' }}>
                    <img
                        src={logoImage}
                        alt="Profile"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                    />
                    <h4 className="text-xl font-weight-bold mb-0 "><b>ALAGAR CLINIC</b></h4>
                </div>
                <br />
                <button
                    style={{ backgroundColor: 'white', width: '250px' }}
                    className="btn text-dark d-flex align-items-center "
                    onClick={handleToggle}
                    type="button"
                    id="dropdownMenuButton"
                    aria-expanded={isOpen}
                >
                    <b>MENU</b> {' '}
                    {isOpen ? <BiChevronUp /> : <BiChevronDown />}
                </button>
                <br />
                <div className={`collapse${isOpen ? ' show' : ''}`} style={{ marginLeft: '50px' }}>
                    <ul className="list-unstyled">
                        {user && (user.user.user_role === 'staff' || user.user.user_role === 'Admin') && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleBillingToggle}>
                                    <FontAwesomeIcon icon={faCashRegister} className="me-2" /> Billing

                                </a>
                            </li>
                        )}

                        <br/>

                        {user && user.user.user_role === 'Admin' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleAddMedicineToggle}>
                                    <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Medicine

                                </a>
                            </li>
                        )}

                        <br/>

                        {user && user.user.user_role === 'Admin' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleFormToggle}>
                                    <FontAwesomeIcon icon={faFileMedical} className="me-2" /> Consultation Form

                                </a>
                            </li>
                        )}

                        <br/>

                        {user && user.user.user_role === 'Admin' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleStockDetailsToggle}>
                                    <FontAwesomeIcon icon={faBoxes} className="me-2" /> Stock Details
                                </a>
                            </li>
                        )}

                        <br/>

                        {user && user.user.user_role === 'Admin' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handlePurchaseToggle}>
                                    <FontAwesomeIcon icon={faFileMedical} className="me-2" /> Purchase Details
                                </a>
                            </li>
                        )}

                        <br/>

                        {user && user.user.user_role === 'Admin' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleBillingHisToggle}>
                                    <FontAwesomeIcon icon={faBoxes} className="me-2" /> Billing History 
                                </a>
                            </li>
                        )}

                        <br/>
                    </ul>
                </div>
                <hr /> 
                <div>
                    {user && <UserProfile user={user} onLogout={handleLogout} />}
                </div>
            </div>

            <div>
                <div className="stock-details-content" style={{ display: showStockDetails ? 'block' : 'none', width: '100vh', height: '100vh' }}>
                    {showStockDetails && (
                        <div className="stock-details-content" style={{ marginLeft: '-400px', height: '100vh' }}>
                            <StockDetailsPage />
                        </div>
                    )}
                </div>

                <div className="stock-details-content" style={{ display: showBilling ? 'block' : 'none', width: '100vh', height: '100vh' }}>
                    {showBilling && (
                        <div className="stock-details-content" style={{ marginLeft: '-400px', height: '100vh' }}>
                            <Billing />
                        </div>
                    )}
                </div>

                <div className="stock-details-content" style={{ display: showAddMedicine ? 'block' : 'none', width: '100vh', height: '100vh' }}>
                    {showAddMedicine && (
                        <div className="stock-details-content" style={{ marginLeft: '-350px', height: '100vh' }}>
                            <AddMedicine />
                        </div>
                    )}
                </div>

                <div className="stock-details-content" style={{ display: showForm ? 'block' : 'none', width: '100vh', height: '100vh' }}>
                    {showForm && (
                        <div className="stock-details-content" style={{ marginLeft: '-350px', height: '100vh' }}>
                            <ConsultationForm />
                        </div>
                    )}
                </div>

                <div className="stock-details-content" style={{ display: showPurchase ? 'block' : 'none', width: '100vh', height: '100vh' }}>
                    {showPurchase && (
                        <div className="stock-details-content" style={{ marginLeft: '-390px', height: '100vh' }}>
                            <Purchase />
                        </div>
                    )}
                </div>

                <div className="stock-details-content" style={{ display: showBillingHis ? 'block' : 'none', width: '100vh', height: '100vh' }}>
                    {showBillingHis && (
                        <div className="stock-details-content" style={{ marginLeft: '-390px', height: '100vh' }}>
                            <BillingHis />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Sidebar;