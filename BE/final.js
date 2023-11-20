const axios = require('axios');
const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid').v4;

const accountSid = 'ACc90419120f2cb0a90fcca862b6bf5a42';
const authToken = 'c91778a9cc7c87fd6a7c1a596418dbbd';
const twilioPhoneNumber = '+919629907152';

const client = twilio(accountSid, authToken);

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

const createPurchaseTableQuery = `
  CREATE TABLE IF NOT EXISTS purchase (
    id INT NOT NULL AUTO_INCREMENT,
    medicinename VARCHAR(20),
    brandname VARCHAR(20),
    otherdetails VARCHAR(100),
    dosage VARCHAR(50),
    purchaseprice INT,  
    totalqty INT,
    purchaseamount INT,
    expirydate DATE,
    mrp INT,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, medicinename, dosage),
    INDEX (medicinename, dosage)
  )
`;

const createStockTableQuery = `
  CREATE TABLE IF NOT EXISTS stocknew (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    medicinename VARCHAR(20), 
    brandname VARCHAR(20), 
    dosage VARCHAR(50),
    purchaseprice INT,
    totalqty INT,
    purchaseamount INT,
    mrp INT,
    purchasedate DATE,
    expirydate DATE,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicinename, dosage) REFERENCES purchase(medicinename, dosage)
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

  connection.query(createPurchaseTableQuery, (err) => {

    if (err) {
      console.error('Error creating the table: ' + err);
    } else {
      console.log('Purchase Table created successfully');
    }
  });

  connection.query(createStockTableQuery, (err) => {

    if (err) {
      console.error('Error creating the table: ' + err);
    } else {
      console.log('Stock Table created successfully');
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
      console.log("result", results)
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

app.get('/allstock', (req, res) => {
  const { medicinename, dosage } = req.query;

  if (!medicinename) {
    res.status(400).json({ error: 'Medicine name is required' });
    return;
  }

  const sql = 'SELECT * FROM stocknew WHERE medicinename = ? AND dosage = ?';

  db.query(sql, [medicinename, dosage], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
      return;
    }

    // Check if results are empty or undefined
    if (!results || results.length === 0) {
      res.status(404).json({ error: 'Medicine not found' });
      return;
    }

    const expiryDateString = results[0].expirydate;
    const expiryDate = new Date(expiryDateString);
    const currentDate = new Date();

    if (expiryDate <= currentDate) {
      res.json({ expired: expiryDate });
    } else {
      res.json({ expired: false });
    }
  });
});


app.get('/stock', (req, res) => {
  const sql = 'SELECT * FROM stocknew';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
      return;
    }
    res.json(results);
  });
});


app.post('/purchase', (req, res) => {
  const {
    medicinename,
    brandname,
    otherdetails,
    purchaseprice,
    totalqty,
    purchaseamount,
    dosage,
    expirydate,
    mrp
  } = req.body;

  const insertPurchaseQuery = `
    INSERT INTO purchase 
      (medicinename, brandname, otherdetails, purchaseprice, totalqty, purchaseamount, dosage, expirydate, mrp) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valuesPurchase = [
    medicinename,
    brandname,
    otherdetails,
    purchaseprice,
    totalqty,
    purchaseamount,
    dosage,
    expirydate,
    mrp
  ];

  db.query(insertPurchaseQuery, valuesPurchase, (err, result) => {
    if (err) {
      console.error('Error inserting data into purchase table:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Data inserted into purchase table successfully');
      // Proceed with updating or inserting into stocknew table
      const selectStockQuery = 'SELECT * FROM stocknew WHERE medicinename = ? AND dosage = ?';

      db.query(selectStockQuery, [medicinename, dosage], (selectErr, selectResults) => {
        if (selectErr) {
          console.error('Error selecting from stocknew:', selectErr);
          res.status(500).send('Internal Server Error');
        } else if (selectResults.length > 0) {
          const existingQuantity = selectResults[0].totalqty;
          const updatedQuantity = existingQuantity + totalqty;

          // Update quantity, purchase price, purchase amount, purchase date, and expiry date in stocknew table
          const updateStockQuery = `
            UPDATE stocknew 
            SET totalqty = ?, 
                purchaseprice = ?, 
                purchaseamount = ?, 
                purchasedate = CURDATE(), 
                expirydate = ?,
                mrp = ?
            WHERE medicinename = ? AND dosage = ?
          `;

          const valuesStock = [
            updatedQuantity,
            purchaseprice,
            purchaseamount,
            expirydate,
            mrp,
            medicinename,
            dosage
          ];

          db.query(updateStockQuery, valuesStock, (updateErr, updateResult) => {
            if (updateErr) {
              console.error('Error updating stocknew:', updateErr);
              res.status(500).send('Internal Server Error');
            } else {
              console.log('Data updated in stocknew table successfully');
              res.status(200).send('Data updated in stocknew successfully');
            }
          });
        } else {
          // Insert a new record into stocknew table
          const insertStockQuery = `
            INSERT INTO stocknew 
              (medicinename, dosage, brandname, purchaseprice, totalqty, purchaseamount, purchasedate, expirydate, mrp) 
              VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)
          `;

          const valuesStock = [
            medicinename,
            dosage,
            brandname,
            purchaseprice,
            totalqty,
            purchaseamount,
            expirydate,
            mrp
          ];

          db.query(insertStockQuery, valuesStock, (errStock, resultStock) => {
            if (errStock) {
              console.error('Error inserting data in stocknew table:', errStock);
              res.status(500).send('Internal Server Error');
            } else {
              console.log('Data inserted into stocknew table successfully');
              res.status(200).send('Data inserted into stocknew successfully');
            }
          });
        }
      });
    }
  });
});


app.get('/quantity', (req, res) => {
  const { medicinename, dosage } = req.query;

  const selectQuantityQuery = 'SELECT totalqty FROM stocknew WHERE medicinename = ? AND dosage = ?';
  console.log("total", selectQuantityQuery)

  db.query(selectQuantityQuery, [medicinename, dosage], (err, results) => {

    if (err) {
      console.error('Error fetching available quantity:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const availableQuantity = results.length > 0 ? results[0].totalqty : 0;
      console.log("total", availableQuantity)

      res.status(200).json({ availableQuantity });
    }
  });
});

app.get('/getMRP', (req, res) => {
  const { medicinename, dosage } = req.query;

  const selectMRPQuery = 'SELECT mrp FROM stocknew WHERE medicinename = ? AND dosage = ?';

  db.query(selectMRPQuery, [medicinename, dosage], (err, results) => {
    if (err) {
      console.error('Error fetching MRP:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const mrp = results.length > 0 ? results[0].mrp : null;
      res.status(200).json({ mrp });
    }
  });
});
// Add this endpoint to your existing Express.js server

app.get('/suggestions', (req, res) => {
  const partialName = req.query.partialName;
  console.log("name", partialName);

  if (!partialName) {
    res.status(400).json({ error: 'Partial name is required' });
    return;
  }

  const tabletSuggestionsQuery = 'SELECT medicinename, dosage FROM stocknew WHERE medicinename LIKE ?';
  const searchTerm = `%${partialName}%`; // Prepare the search term with wildcards

  db.query(tabletSuggestionsQuery, [searchTerm], (err, results) => {
    if (err) {
      console.error('Error fetching tablet suggestions:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const suggestions = results.map((row) => ({ medicinename: row.medicinename, dosage: row.dosage }));
      res.status(200).json({ suggestions });
    }
  });
});

app.post('/send-bill', async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber;
    const message = req.body.message;

    // Sending WhatsApp message using Twilio API
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:+12014742001`,
      to: `whatsapp:+919629907152`,
    });

    console.log('WhatsApp message sent:', result);
    res.json({ success: true, message: 'WhatsApp message sent successfully.' });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ success: false, message: 'Error sending WhatsApp message.' });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
