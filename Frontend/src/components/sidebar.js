import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import logoImage from '../logo/logo.jpg';
import backgroundImage from '../logo/image.jpg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faCashRegister, faPlus, faBoxes, faFileMedical  } from '@fortawesome/free-solid-svg-icons';
import StockDetailsPage from './stock';
import AddMedicine from './addmedicine';
import Billing from './billing';
import ConsultationForm from './consultationform';
import { BiChevronUp, BiChevronDown } from 'react-icons/bi';

// import bgImage from '../logo/y.jpeg';




const UserProfile = ({ user, onLogout }) => {
    const history = useHistory();

    const handleLogout = () => {
        localStorage.removeItem('user');
        history.push('/');
        window.location.reload();
        onLogout();
    };

    return (
        <div className="flex-grow-0" style={{fontFamily:'serif'}}>
            <div className="d-flex align-items-center ">
                {user && user.user.user_profile_photo && (
                    <img
                        src={user.user.user_profile_photo}
                        alt="Profile"
                        style={{ width: '50px', height: '60px', marginRight: '5px', borderRadius: '50%', marginBottom: '15px' }}
                    />
                )}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{lineHeight:'2px'}}>
                        <h6>
                            <b> {user ? ` ${user.user.user_role} ` : 'Guest'}</b>
                        </h6>
                        <h6>
                            <b> {` ${user.user.user_first_name} ${user.user.user_last_name} ` }</b>
                        </h6>
                        <p style={{ fontSize: '12px' }}>{user ? user.user.user_email : ''}</p>
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

const HomeContent = () => {
    const imageContainerStyle = {
        position: 'relative',
        width: '1050px',
        height: '590px'
    };

    const overlayStyle = {
        position: 'absolute',
        content: '',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        // background: 'linear-gradient(to bottom right, rgba(173, 216, 230, 0.7), rgba(50, 50, 50, 0.3))', // Light black shadow color

    };

    return (
        <div className="m-4" >
            <div className="row">
                <div className="col-md-12 position-relative" style={imageContainerStyle}>
                    <div style={overlayStyle}></div>
                    <img
                        src={backgroundImage}
                        alt="Description of the image"
                        className="img-fluid w-100 h-100"
                    />

<div className="d-flex align-items-center position-absolute top-50 translate-middle text-center text-black display-4" style={{ fontWeight: 'bold', fontFamily: 'Helvetica, sans-serif', marginTop:'-250px', marginLeft:'150px' }}>
                    {/* Logo */}
                    <img
                        src={logoImage}
                        alt="Profile"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                    />
                    {/* Clinic Name */}
                    <h4 className="text-xl font-weight-bold mb-0"><b>ALAGAR CLINIC</b></h4>
                </div>
                    <h2 className="position-absolute top-50 start-50 translate-middle text-center text-black display-4" style={{ fontWeight: 'bold', fontFamily:'serif', marginTop:'60px' }}>
                        Our only priority is to keep you healthy.
                    </h2>
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
    const [showHomeContent, setShowHomeContent] = useState(true);

    // Function to toggle visibility of StockDetails based on user role
    const handleStockDetailsToggle = () => {
        if (user && user.user.user_role === 'Admin') {
            setShowBilling(false);
            setShowStockDetails(!showStockDetails);
            setShowAddMedicine(false);
            setShowForm(false);
            setShowHomeContent(false);
        }
    };

    // Function to toggle visibility of Billing based on user role
    const handleBillingToggle = () => {
        if (user && user.user.user_role === 'staff' || user.user.user_role === 'Admin') {
            setShowBilling(!showBilling);
            setShowStockDetails(false);
            setShowAddMedicine(false);
            setShowForm(false);
            setShowHomeContent(false);
        }
    };

    // Function to toggle visibility of AddMedicine based on user role
    const handleAddMedicineToggle = () => {
        if (user && user.user.user_role === 'Admin') {
            setShowBilling(false);
            setShowStockDetails(false);
            setShowAddMedicine(!showAddMedicine);
            setShowForm(false);
            setShowHomeContent(false);
        }
    };

    // Function to toggle visibility of ConsultationForm based on user role
    const handleFormToggle = () => {
        if (user && user.user.user_role === 'Admin') {
            setShowBilling(false);
            setShowStockDetails(false);
            setShowAddMedicine(false);
            setShowForm(!showForm);
            setShowHomeContent(false);
        }
    };

    // Function to handle toggling the sidebar menu
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
        // Handle any additional logic upon logout if needed
    };

    return (
        <div className="d-flex justify-content-between"  >
            {/* Sidebar Menu */}
            <div  className=' shadow-sm p-3 bg-white rounded ' 
            
        //     style={{ 
           
        //     backgroundImage: `url(${bgImage})`, // Set your background image
        //     backgroundSize: '100% 100%',
        //    backgroundRepeat:'no-repeat',
        //     fontFamily: 'serif',
        //     width: '20rem', height: '100vh'}} 


            >
                {/* Logo and Header */}
                <div className="d-flex align-items-center">
                    {/* Logo */}
                    <img
                        src={logoImage}
                        alt="Profile"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                    />
                    {/* Clinic Name */}
                    <h4 className="text-xl font-weight-bold mb-0"><b>ALAGAR CLINIC</b></h4>
                </div>
                <br />
                {/* Toggle Button for Sidebar Menu */}
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
                {/* Sidebar Menu Items */}
                <div className={`collapse${isOpen ? ' show' : ''}`} style={{ marginLeft: '50px' }}>
                    <ul className="list-unstyled">
                        {/* Billing (Shown for staff and Admin) */}
                        {user && (user.user.user_role === 'staff' || user.user.user_role === 'Admin') && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleBillingToggle}>
                                <FontAwesomeIcon icon={faCashRegister} className="me-2" /> Billing

                                </a>
                            </li>
                        )}
                        {/* Add Medicine (Shown only for Admin) */}
                        {user && user.user.user_role === 'Admin' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleAddMedicineToggle}>
                                <FontAwesomeIcon icon={faPlus} className="me-2" /> Add Medicine

                                </a>
                            </li>
                        )}
                        {/* Consultation Form (Shown only for Admin) */}
                        {user && user.user.user_role === 'Admin' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleFormToggle}>
                                <FontAwesomeIcon icon={faFileMedical} className="me-2" /> Consultation Form

                                </a>
                            </li>
                        )}
                        {/* Stock Details (Shown only for Admin) */}
                        {user && user.user.user_role === 'Admin' && (
                            <li className="mb-2">
                                <a href="#" className="text-decoration-none text-dark" onClick={handleStockDetailsToggle}>
                                <FontAwesomeIcon icon={faBoxes} className="me-2" /> Stock Details
                                </a>
                            </li>
                        )}
                    </ul>
                </div>
                <hr />
                {/* User Profile Section */}
                <div>
                    {user && <UserProfile user={user} onLogout={handleLogout} />}
                </div>
            </div>

            {/* Main Content Sections */}
            <div>
                {showHomeContent && <HomeContent />}

                <div className="stock-details-content" style={{ display: showStockDetails ? 'block' : 'none', width: '100vh', height: '100vh' }}>
                    {showStockDetails && (
                        <div className="stock-details-content" style={{ marginLeft: '-400px', height: '100vh' }}>
                            <StockDetailsPage />
                        </div>
                    )}
                </div>

                {/* Billing */}
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

                {/* Consultation Form */}
                <div className="stock-details-content" style={{ display: showForm ? 'block' : 'none', width: '100vh', height: '100vh' }}>
                    {showForm && (
                        <div className="stock-details-content" style={{ marginLeft: '-350px', height: '100vh' }}>
                            <ConsultationForm />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;