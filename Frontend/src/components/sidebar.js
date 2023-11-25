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
        if (user && user.user.user_role === 'Staff' || user.user.user_role === 'Admin') {
            setShowBilling(false);
            setShowStockDetails(!showStockDetails);
            setShowAddMedicine(false);
            setShowForm(false);
            setShowPurchase(false);
            setShowBillingHis(false);
        }
    };

    const handleBillingToggle = () => {
        setShowBilling(prevState => !prevState);

        if (user && user.user.user_role === 'Staff' || user.user.user_role === 'Admin') {
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
                setShowBilling(true);
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
                    width:'28%',
                    height: '100vh',
                    fontFamily: 'serif',
                }}
            >
                <div className="d-flex align-items-center" >
                    <div>
                    <img
                        src={logoImage}
                        alt="Profile"
                        style={{ width: '60px', height: '60px', borderRadius: '50%',marginTop:'-10px', marginRight: '10px' }}
                    />
                    </div>  
                    <div style={{fontSize:'12px', lineHeight:'1px'}}>
                    <h4 className="ms-3 "><b>ALAGAR CLINIC</b></h4>
                <p>Plot No-1, Fenner Colony, Virattipattu, Madurai-16</p>
                <p style={{marginLeft:'48px'}}><b>Contact:</b>88072 62725</p>
                    </div>                   
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
                        {user && (user.user.user_role === 'Staff' || user.user.user_role === 'Admin') && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleBillingToggle}>
                                    <FontAwesomeIcon icon={faCashRegister} className="me-2" /><b>Billing</b> 

                                </a>
                            </li>
                        )}

                        {user && user.user.user_role === 'Staff' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleStockDetailsToggle}>
                                    <FontAwesomeIcon icon={faBoxes} className="me-2" /> <b>Stock Details</b>
                                </a>
                            </li>
                        )}

                        <br/>

                        {user && user.user.user_role === 'Admin' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleAddMedicineToggle}>
                                    <FontAwesomeIcon icon={faPlus} className="me-2" /><b>Add Medicine</b> 

                                </a>
                            </li>
                        )}

                        <br/>

                        {user && user.user.user_role === 'Admin' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleFormToggle}>
                                    <FontAwesomeIcon icon={faFileMedical} className="me-2" /><b>Consultation Form</b> 

                                </a>
                            </li>
                        )}

                        <br/>

                        {user && user.user.user_role === 'Admin' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleStockDetailsToggle}>
                                    <FontAwesomeIcon icon={faBoxes} className="me-2" /><b>Stock Details</b> 
                                </a>
                            </li>
                        )}
                        <br/>
                        {user && user.user.user_role === 'Admin' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handlePurchaseToggle}>
                                    <FontAwesomeIcon icon={faFileMedical} className="me-2" /> <b>Purchase History</b>
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

            <div style={{width:'70%'}}>
                <div >
                
                <div className="stock-details-content" style={{ display: showStockDetails ? 'block' : 'none'}}>
                    {showStockDetails && (
                        <div className="stock-details-content" >
                            <StockDetailsPage />
                        </div>
                    )}
                </div>

                <div className="billing-content" style={{ display: showBilling ? 'block' : 'none' }}>
                    {showBilling && (
                        <div className="billing-content" >
                            <Billing />
                        </div>
                    )}
                </div>

                <div className="stock-details-content" style={{ display: showAddMedicine ? 'block' : 'none' }}>
                    {showAddMedicine && (
                        <div className="stock-details-content" >
                            <AddMedicine />
                        </div>
                    )}
                </div>

                <div className="stock-details-content" style={{ display: showForm ? 'block' : 'none'}}>
                    {showForm && (
                        <div className="stock-details-content" >
                            <ConsultationForm />
                        </div>
                    )}
                </div>

                <div className="stock-details-content" style={{ display: showPurchase ? 'block' : 'none'}}>
                    {showPurchase && (
                        <div className="stock-details-content" >
                            <Purchase />
                        </div>
                    )}
                </div>

                <div className="stock-details-content" style={{ display: showBillingHis ? 'block' : 'none' }}>
                    {showBillingHis && (
                        <div className="stock-details-content" >
                            <BillingHis />
                        </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;