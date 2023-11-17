const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid').v4;

const app = express();
const port = 3000;
app.use(cors());

const db = mysql.createPool({
    host: 'fivewhyrds.ctxjvxl0k0dq.us-east-1.rds.amazonaws.com',
    user: 'fivewhyadmin',
    password: 'Yayaya#143',
    database: '5ydatabase'
});

const createUsersTableQuery = `
  CREATE TABLE IF NOT EXISTS \`user\` (
    \`user_id\` VARCHAR(36) PRIMARY KEY,
    \`user_first_name\` VARCHAR(255),
    \`user_last_name\` VARCHAR(255),
    \`user_email\` VARCHAR(255) UNIQUE,
    \`user_mobile_number\` VARCHAR(20),
    \`user_password\` VARCHAR(255),
    \`user_token\` VARCHAR(255),
    \`user_timestamp\` TIMESTAMP,
    \`user_profile_photo\` VARCHAR(255)
  )
`;


db.query(createUsersTableQuery, (error, result) => {
  if (error) {
    throw new Error("Error creating users table: " + error.message);
  }

  console.log("Users table created successfully");
});

app.use(express.json());

const privateKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCKYCCU+icNr+dlESZOSomuTvi7Sv5HXbV2+RGzNWNGhnQYLGSPYFh3NRZ7HuP3C1M+sI2vX1UGb/AXlucw+pDLQpungBOyyi9zwsyzgBvdeZRFNj3V9tn3CQaEPTXbBFwSszmpPZvdk58L/YCru3G2XPdFNpKnv0Q7yiiiMWIX0wIDAQAB"; 

app.post('/register', async (req, res) => {
  try {
    const reqData = req.body;

    if (Object.keys(reqData).length === 0) {
      throw new Error("Please provide data.");
    }

    const existingEmailQuery = 'SELECT COUNT(*) as count FROM user WHERE user_email = ?';

    db.query(existingEmailQuery, [reqData.user_email, reqData.user_mobile_number], async (error, results) => 
     {
      if (error) {
        throw new Error("Database error: " + error.message);
      }

      if (results[0].count > 0) {
        throw new Error("Email already exists.");
      }

      const enpPassword = await bcrypt.hash(reqData.user_password, 10);
      const token = jwt.sign(reqData, privateKey);
      const user = 'userid-' + uuid();

      const insertUserQuery = `
        INSERT INTO user (user_id, user_first_name, user_last_name, user_email, user_mobile_number, user_password, user_token, user_timestamp, user_profile_photo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [user, 
        reqData.user_first_name, 
        reqData.user_last_name,
         reqData.user_email, 
         reqData.user_mobile_number,
         enpPassword,
          token,
          new Date(), 
          reqData.user_profile_photo];

      db.query(insertUserQuery, values, (error, result) => {
        if (error) {
          throw new Error("Error inserting user: " + error.message);
        }

        res.status(200).json({ "status": 200, "data": result, "message": "User added successfully", "error": false });
      });
    });
  } catch (error) {
    res.status(400).json({ "status": 400, "message": error.message, "error": true });
  }
});

app.post('/login', async (req, res) => {
    try {
      const { loginIdentifier, password } = req.body;

      const getUserQuery = `
        SELECT * FROM user WHERE user_email = ? OR user_mobile_number = ?
      `;
  
      db.query(getUserQuery, [loginIdentifier, loginIdentifier], async (error, results) => {
        if (error) {
          throw new Error("Database error: " + error.message);
        }
      
        if (results.length === 0) {
          throw new Error("Invalid credentials.");
        }
      
        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.user_password);
      
        if (!passwordMatch) {
          const errorMessage = `No user found for loginIdentifier: ${loginIdentifier}`;
          console.error(errorMessage);
          throw new Error("Invalid credentials.");
        }
      
        // Generate JWT token
        const token = jwt.sign({ user_id: user.user_id }, privateKey);
      
        res.status(200).json({
          "status": 200,
          "data": { token, user },
          "message": "Login successful",
          "error": false
        });
      });
      
    } catch (error) {
      res.status(400).json({ "status": 400, "message": error.message, "error": true });
    }
  });
  

  app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


