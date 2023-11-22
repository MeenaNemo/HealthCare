import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import logoImage from '../logo/logo.jpg'; // Adjust the path as needed

const styles = {
  
  loginContainer: {
    background: `url('../Assets/e.jpeg') `, // Replace 'path_to_your_image.jpg' with the actual path to your image
    backgroundSize: '100%  100%', // Set width to 50% and auto height to maintain aspect ratio
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    minHeight: '100vh', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: '15px',
  }
};

const Login = () => {
  const history = useHistory();

  const [loginData, setLoginData] = useState({
    loginIdentifier: '',
    password: ''
  });
  const [error, setError] = useState('');


  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/login', loginData);
      console.log(response.data);
      if(response.data.status === 200){
        alert("Login Successful!")
        localStorage.setItem('user', JSON.stringify(response.data.data))
        history.push('/sidebar');
        window.location.reload();
      }
      // Handle successful login - set token in local storage and redirect
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.message;
        if (errorMessage === "Invalid credentials.") {
          alert('Invalid email/mobile number or password.');
        } else if (errorMessage === "Invalid email/mobile number.") {
          alert('Invalid email/mobile number.');
        } else if (errorMessage === "Invalid password.") {
          alert('Invalid password.'); 
        } else {
          setError(errorMessage); // Update error state with the general error message
        }
      } else if (error.response) {
        // Handle other specific response errors here if needed
        console.error('An error occurred:', error.response.data);
        alert('Error: ' + error.response.data); // Display specific error message from server response
      } else {
               console.error('An unexpected error occurred:', error);
        alert('Invalid username and password');
      }
    
  };
  
   
  };

  return (
    <div style={styles.loginContainer} >
      <div className="col-md-3" style={{height:'300px', marginTop:'-150px', marginLeft:'150px'}}>
        <div style={styles.card}> 
        {/* className="card shadow" */}
          <div className="card-body">
         <div> {error && <div className="alert alert-danger" role="alert">{error}</div>}</div>
         <img
              src={logoImage} 
              alt="Profile"
              style={{ width: '1o0px', height: '100px', marginLeft: '100px', borderRadius: '100%'}}
            />
            <br/> <br/>
            <h2 className="card-title text-center mb-4">Log in to your account</h2>
            <h6 style={{ color: 'GrayText', textAlign: 'center' }}>Welcome back! Please enter your details</h6>
            <br/>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email/Mobile number</label>
                <input
                  type="text"
                  name="loginIdentifier"
                  placeholder="Email or Mobile Number"
                  className="form-control"
                  value={loginData.loginIdentifier}
                  onChange={handleChange}
                  required
                />
              </div>
              <br/>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="form-control"
                  value={loginData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <br/>
              <button type="submit" className="btn btn-info btn-block w-100 " >Sign in</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
