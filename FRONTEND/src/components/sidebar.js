import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import logoImage from '../logo/logo.jpeg'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import StockDetailsPage from './stock';
import AddMedicine from './addmedicine';
import Billing from './billing';
import ConsultationForm from './consultationform';

const UserProfile = ({ user, onLogout  }) => {  
    const history = useHistory();

    const handleLogout = () => {
        // Perform logout functionality, such as clearing user data or token
        // For example, you can clear the user data from localStorage
        localStorage.removeItem('user');
        history.push('/');
        window.location.reload();
        onLogout();
      };

    return (
      <div className="flex-grow-0">
        <div className="d-flex align-items-center ">
          {user && user.user.user_profile_photo && (
            <img
              src={user.user.user_profile_photo} 
              alt="Profile"
              style={{ width: '50px', height: '40px', marginRight: '5px', borderRadius: '50%', marginBottom:'15px' }}
            />
          )}
          <div style={{display: 'flex', alignItems: 'center'}}>
          <div style={{fontSize:'12px'}}>
            <h6>
              <b> {user ? `${user.user.user_first_name} ${user.user.user_last_name}` : 'Guest'}</b>
            </h6>
            <p>{user ? user.user.user_email : ''}</p>
            </div>
            <div style={{marginTop:'-20px'}}>
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
  const [showOrders, setShowOrders] = useState(false);



  const handleStockDetailsToggle = () => {
    setShowStockDetails(!showStockDetails);
    setShowBilling(false);
    setShowAddMedicine(false);
    setShowOrders(false);
  };

  const handleBillingToggle = () => {
    setShowBilling(!showBilling);
    setShowStockDetails(false);
    setShowAddMedicine(false);
    setShowOrders(false);
  };


  const handleAddMedicineToggle = () => {
    setShowAddMedicine(!showAddMedicine);
    setShowBilling(false);
    setShowStockDetails(false);
    setShowOrders(false);
  };

  const handleOrdersToggle = () => {
    setShowOrders(!showOrders);
    setShowBilling(false);
    setShowAddMedicine(false);
    setShowStockDetails(false);
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

  const handleLogout = () => {
    // Perform logout actions, e.g., clearing user state, redirecting to login page, etc.
    setUser(null); // Clear the user state
    
  };
  
    return (
      <div className="d-flex justify-content-between " >
        <div style={{ width: '20rem', height:'100vh'}} className=' shadow-sm p-3 bg-white rounded '>
        <div className="d-flex align-items-center">
      <img
        src={logoImage}
        alt="Profile"
        style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
      />
      <h4 className="text-xl font-weight-bold mb-0"><b>ALAGAR CLINIC</b></h4>
    </div>
    <br/>
    <button
          style={{ backgroundColor: 'lightgray', width: '250px' }}
          className="btn text-dark d-flex align-items-center "
          onClick={handleToggle}
          type="button"
          id="dropdownMenuButton"
          aria-expanded={isOpen}
        >
          Menu <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`} style={{marginLeft:'150px'}}></i>
        </button>
        <br/>
        <div className={`collapse${isOpen ? ' show' : ''}`} style={{marginLeft:'50px'}}>
          <ul className="list-unstyled">
            <li className="mb-2">
              <a href="#" className="text-decoration-none text-dark" onClick={handleBillingToggle}>
                Billing
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="text-decoration-none text-dark" onClick={handleAddMedicineToggle}>
                Add Medicine
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="text-decoration-none text-dark" onClick={handleOrdersToggle}>
              Consultation Form
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="text-decoration-none text-dark" onClick={handleStockDetailsToggle}>
                Stock Details
              </a>
            </li>
          </ul>
        </div>
        
        <hr />
       
        <div>
        {user && <UserProfile user={user} onLogout={handleLogout} />}

        </div>
        </div>


        <div className="stock-details-content" style={{ display: showStockDetails ? 'block' : 'none',width:'100vh', height:'100vh'  }}>
                    {showStockDetails && (
                <div className="stock-details-content" style={{ marginLeft:'-400px', height: '100vh' }}>
                    <StockDetailsPage />
                </div>)}          
        </div>


        <div className="stock-details-content" style={{ display: showBilling ? 'block' : 'none',width:'100vh', height:'100vh'  }}>
                    {showBilling && (
                <div className="stock-details-content" style={{ marginLeft:'-400px', height: '100vh' }}>
                    <Billing />
                    </div> )}          
        </div>

           
        <div className="stock-details-content" style={{ display: showAddMedicine ? 'block' : 'none',width:'100vh', height:'100vh'  }}>
                    {showAddMedicine && (
                <div className="stock-details-content" style={{ marginLeft:'-400px', height: '100vh' }}>
                    <AddMedicine />
                </div>)}          
        </div>

        <div className="stock-details-content" style={{ display: showOrders ? 'block' : 'none',width:'100vh', height:'100vh'  }}>
                    {showOrders && (
                <div className="stock-details-content" style={{ marginLeft:'-400px', height: '100vh' }}>
                    <ConsultationForm />
                </div>)}          
        </div>

      </div>
    );
  };

export default Sidebar;