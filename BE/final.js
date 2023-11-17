const axios = require('axios');
const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid').v4;
const bodyParser = require('body-parser');

app.use(cors());
app.use(express.json()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createPool({
  host: 'fivewhyrds.ctxjvxl0k0dq.us-east-1.rds.amazonaws.com',
  user: 'fivewhyadmin',
  password: 'Yayaya#143',
  database: '5ydatabase',
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
  




const createPurchaseTableQuery = `
  CREATE TABLE IF NOT EXISTS purchase (
    id INT NOT NULL AUTO_INCREMENT,
    medicinename VARCHAR(20),
    brandname VARCHAR(20),
    otherdetails VARCHAR(100),
    dosage VARCHAR(50),
    buyingprice INT,  
    totalqty INT,
    purchaseamount INT,
    expirydate DATE,
    mrp INT,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, medicinename)
  )
`;

const createBillingTableQuery = `
CREATE TABLE IF NOT EXISTS billing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tabletdetails JSON, 
  subtotal DECIMAL(10,2),  
  discount DECIMAL(10,2),
  grandtotal DECIMAL(10,2),
  patientname VARCHAR(255),
  doctorname VARCHAR(255),
  mobileno VARCHAR(20),
  cashgiven DECIMAL(10,2),
  balance DECIMAL(10,2),
  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

const createStockTableQuery = `
  CREATE TABLE IF NOT EXISTS stocknew (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    medicinename VARCHAR(20),
    brandname VARCHAR(20), 
    dosage VARCHAR(50),
    buyingprice INT,
    totalqty INT,
    purchaseamount INT,
    purchasedate DATE,
    expirydate DATE,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
    )
`;


db.getConnection((connectionError, connection) => {
    if (connectionError) {
      console.error('Database connection failed: ' + connectionError.stack);
      return;
    }
    
    connection.query(createBillingTableQuery, (err) => {
  
      if (err) {
        console.error('Error creating the table: ' + err);
      } else {
        console.log('Billing Table created successfully');
      }
    });

    connection.query(createStockTableQuery, (err) => {
  
        if (err) {
          console.error('Error creating the table: ' + err);
        } else {
          console.log('Stock Table created successfully');
        }
      });

      connection.query(createPurchaseTableQuery, (err) => {
  
        if (err) {
          console.error('Error creating the table: ' + err);
        } else {
          console.log('Purchase Table created successfully');
        }
      });
  
  });

  app.post('/billing', (req, res) => {
    const billingData = req.body;
  
    for (const row of billingData.medicineRows) {
        const { medicinename, qty } = row;
    
        // Perform a query to update the stock in the database
        const updateStockQuery = 'UPDATE stocknew SET totalqty = totalqty - ? WHERE medicinename = ?';
        db.query(updateStockQuery, [qty, medicinename], (err, results) => {
            console.log ("result", results)
          if (err) {
            console.error('Error updating stock quantity:', err);
          }
          console.log(`Stock updated for ${medicinename}`);
        });
      }

    // Structure the tablet details as a JSON object
    const tabletDetails = {
        tablets: billingData.medicineRows.map((row) => ({
          medicinename: row.medicinename,
          qty: row.qty,
          qtyprice: row.qtyprice,
          total: row.total,
        })),
      };
  
    // Insert data into MySQL table
    const sql = `INSERT INTO billing
    (tabletdetails, subtotal, discount, grandtotal, patientname, doctorname, mobileno, cashgiven, balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
    db.query(sql, [
        JSON.stringify(tabletDetails), // Convert tabletDetails to JSON string
        billingData.subtotal,
        billingData.discount,
        billingData.grandtotal,
        billingData.patientname,
        billingData.doctorname,
        billingData.mobileno,
        billingData.cashgiven,
        billingData.balance
    ], (err, result) => {
      if (err) throw err;
      console.log('Billing data inserted:', result);
      res.send('Billing data inserted successfully!');
    });
  });
  
  app.get('/stock', (req, res) => {
    const { medicinename } = req.query;
  
    if (!medicinename) {
      res.status(400).json({ error: 'Medicine name is required' });
      return;
    }
  
    const sql = 'SELECT * FROM stocknew WHERE medicinename = ?';
    db.query(sql, medicinename, (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Error fetching data' });
        return;
      }
  
      if (results.length === 0) {
        res.status(404).json({ error: 'Medicine not found' });
        return;
      }
  
      const expiryDateString = results[0].expirydate;
      const expiryDate = new Date(expiryDateString); // Convert expiry date string to Date object
      const currentDate = new Date(); // Current date
  
      if (expiryDate <= currentDate) {
        res.json({ expired: true }); // Return expired status
      } else {
        res.json({ expired: false }); // Return not expired status
      }
    });
  });
  

  app.post('/purchase', (req, res) => {
    console.log('Received POST request to /purchase', req.body); // Add this line
  
    const {
      medicinename,
      brandname,
      otherdetails,
      buyingprice,
      totalqty,
      purchaseamount,
      dosage,
      expirydate,
      mrp
    } = req.body;
  
    const insertPurchaseQuery = `
    INSERT INTO purchase 
      (medicinename, brandname, otherdetails, buyingprice, totalqty, purchaseamount, dosage, expirydate, mrp) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
  const valuesPurchase = [
    medicinename,
    brandname,
    otherdetails,
    buyingprice, 
    totalqty,
    purchaseamount,
    dosage,
    expirydate,
    mrp
  ];
  
  db.query(insertPurchaseQuery, valuesPurchase, (err, result) => {
    if (err) {
        console.error('Error inserting data into purchase table: ' + err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Data inserted into purchase table successfully');
  
        // Now, insert the same data into the stock table or update if it already exists
        const updateStockQuery = `
          INSERT INTO stocknew 
            (medicinename, dosage, brandname, buyingprice, totalqty, purchaseamount, purchasedate, expirydate) 
          VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?)
          ON DUPLICATE KEY UPDATE
            dosage = VALUES(dosage),
            brandname = VALUES(brandname),
            buyingprice = VALUES(buyingprice),
            totalqty = totalqty + VALUES(totalqty),
            purchaseamount = VALUES(purchaseamount),
            purchasedate = CURDATE(),
            expirydate = VALUES(expirydate)
        `;
  
        const valuesStock = [
          medicinename, // Use the medicinename as the foreign key in the stock table
          dosage,
          brandname,
          buyingprice,
          totalqty,
          purchaseamount,
          expirydate
        ];
  
  
        db.query(updateStockQuery, valuesStock, (errStock, resultStock) => {
          if (errStock) {
            console.error('Error updating or inserting data in stock table: ' + errStock);
            res.status(500).send('Internal Server Error');
          } else {
            console.log('Data updated or inserted in stock table successfully');
            res.status(200).send('Data updated or inserted successfully');
          }
        });
      }
    });
  });
  
  app.get('/quantity', (req, res) => {
    const medicinename = req.query.medicinename;
  
    const selectQuantityQuery = 'SELECT totalqty FROM stocknew WHERE medicinename = ?';
    console.log("total",selectQuantityQuery )
  
    db.query(selectQuantityQuery, [medicinename], (err, results) => {

      if (err) {
        console.error('Error fetching available quantity:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const availableQuantity = results.length > 0 ? results[0].totalqty: 0;
        console.log("total",availableQuantity )

        res.status(200).json({ availableQuantity });
      }
    });
  });

  app.get('/getMRP', (req, res) => {
    const medicinename = req.query.medicinename;
  
    const selectMRPQuery = 'SELECT purchaseamount FROM purchase WHERE medicinename = ?';
  
    db.query(selectMRPQuery, [medicinename], (err, results) => {
      if (err) {
        console.error('Error fetching MRP:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const mrp = results.length > 0 ? results[0].purchaseamount : null;
        res.status(200).json({ mrp });
      }
    });
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
