const express = require('express');
const mysql = require('mysql');
const axios = require('axios');
const multer = require('multer');
const app = express();
const port = 3000;
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuid').v4;
const path = require('path');
const fs = require('fs'); 


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createPool({
  host: 'fivewhyrds.ctxjvxl0k0dq.us-east-1.rds.amazonaws.com',
  user: 'fivewhyadmin',
  password: 'Yayaya#143',
  database: 'Alagar_Clinic',
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';

    // Create the 'uploads' directory if it doesn't exist
    fs.mkdir(uploadPath, { recursive: true }, function (err) {
      if (err) {
        console.error("Error creating directory:", err);
      }
      cb(null, uploadPath);
    });
  },
  filename: function (req, file, cb) {
    cb(null, uuid() + path.extname(file.originalname)); // Unique filename for uploaded files
  },
});

const upload = multer({ storage: storage });

// Create User_Inventory table if not exists
const createUsersTableQuery = `
  CREATE TABLE IF NOT EXISTS User_Inventory (
    user_id  VARCHAR(36) PRIMARY KEY,
    user_first_name VARCHAR(255),
    user_last_name VARCHAR(255),
    user_email VARCHAR(255) UNIQUE,
    user_mobile_number VARCHAR(20),
    user_role VARCHAR(20),
    user_password VARCHAR(255),
    user_token VARCHAR(255),
    user_timestamp TIMESTAMP,
    user_profile_photo VARCHAR(255)
  )
`;

db.query(createUsersTableQuery, (error, result) => {
  if (error) {
    throw new Error("Error creating User_Inventory table: " + error.message);
  }
  console.log("User_Inventory table created successfully");
});

const privateKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCKYCCU+icNr+dlESZOSomuTvi7Sv5HXbV2+RGzNWNGhnQYLGSPYFh3NRZ7HuP3C1M+sI2vX1UGb/AXlucw+pDLQpungBOyyi9zwsyzgBvdeZRFNj3V9tn3CQaEPTXbBFwSszmpPZvdk58L/YCru3G2XPdFNpKnv0Q7yiiiMWIX0wIDAQAB"; 

app.post('/register', upload.single('user_profile_photo'), async (req, res) => {
  try {
    const reqData = req.body;
    const filePath = req.file ? req.file.path : null;

    if (Object.keys(reqData).length === 0) {
      throw new Error("Please provide data.");
    }

    // Check if email already exists
    const existingEmailQuery = 'SELECT COUNT(*) as count FROM User_Inventory WHERE user_email = ?';
    db.query(existingEmailQuery, [reqData.user_email], async (error, results) => {
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
        INSERT INTO User_Inventory (user_id, user_first_name, user_last_name, user_email, user_mobile_number, user_role, user_password, user_token, user_timestamp, user_profile_photo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        user,
        reqData.user_first_name,
        reqData.user_last_name,
        reqData.user_email,
        reqData.user_mobile_number,
        reqData.user_role,
        enpPassword,
        token,
        new Date(),
        filePath, // Store the file path in the database
      ];

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
        SELECT * FROM User_Inventory WHERE user_email = ? OR user_mobile_number = ?
      `;
  
      db.query(getUserQuery, [loginIdentifier, loginIdentifier], async (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Database error' });
        }
    
        if (results.length === 0) {
          return res.status(401).json({ message: 'Invalid username' });
        }
    
        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.user_password);
    
        if (!passwordMatch) {
          return res.status(401).json({ message: 'Invalid password' });
        }

        if ((results.length === 0) && (!passwordMatch) ) {
          return res.status(401).json({ message: 'Invalid username and password' });
        }
       
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
  CREATE TABLE IF NOT EXISTS Purchase_Inventory (
    id INT NOT NULL AUTO_INCREMENT,
    medicinename VARCHAR(20),
    brandname VARCHAR(20),
    otherdetails VARCHAR(100),
    dosage VARCHAR(50),
    purchaseprice DECIMAL(10,2),  
    totalqty INT,
    purchaseamount DECIMAL(10,2),
    expirydate DATE,
    mrp DECIMAL(10,2),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, medicinename, dosage),
    INDEX (medicinename, dosage)
  )
`;

const createStockTableQuery = `
  CREATE TABLE IF NOT EXISTS Stock_Inventory (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    medicinename VARCHAR(20), 
    brandname VARCHAR(20), 
    dosage VARCHAR(50),
    purchaseprice DECIMAL(10,2),
    totalqty INT,
    purchaseamount DECIMAL(10,2),
    mrp DECIMAL(10,2),
    purchasedate DATE,
    expirydate DATE,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicinename, dosage) REFERENCES Purchase_Inventory(medicinename, dosage)
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
      console.log('Billing_Inventory Table created successfully');
    }
  });

  connection.query(createPurchaseTableQuery, (err) => {

    if (err) {
      console.error('Error creating the table: ' + err);
    } else {
      console.log('Purchase_Inventory Table created successfully');
    }
  });

  connection.query(createStockTableQuery, (err) => {

    if (err) {
      console.error('Error creating the table: ' + err);
    } else {
      console.log('Stock_Inventory Table created successfully');
    }
  });

});


const createBillingTableQuery = `
CREATE TABLE IF NOT EXISTS Billing_Inventory (
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
  invoice_number VARCHAR(20),
  createdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

async function generateInvoiceNumber() {
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(2); // Extract the last two digits of the year
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so add 1
  const day = String(currentDate.getDate()).padStart(2, '0'); // Day of the month

  // Retrieve the last invoice number from your database
  const getLastInvoiceNumberQuery = 'SELECT MAX(CAST(SUBSTRING(invoice_number, 7) AS UNSIGNED)) as lastInvoiceNumber FROM Billing_Inventory';
 
  const lastInvoiceNumberResult = await new Promise((resolve, reject) => {
    db.query(getLastInvoiceNumberQuery, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0].lastInvoiceNumber || 0);
      }
    });
  });

  // Increment the last invoice number and format it
  const nextInvoiceNumber = `${year}${month}${day}${String(lastInvoiceNumberResult + 1).padStart(5, '0')}`;
  return nextInvoiceNumber;
}



app.post('/billing', async (req, res) => {
  try {
    const billingData = req.body;
    const medData = req.body.medicinename;
    const {medicinename, dosage} = extractMedicineInfo(medData);
   
    const invoicenumber = await generateInvoiceNumber();

    for (const row of billingData.medicineRows) {
      const { qty } = row;

      const updateStockQuery = 'UPDATE Stock_Inventory SET totalqty = totalqty - ? WHERE medicinename = ? and dosage = ?';
      db.query(updateStockQuery, [qty, medicinename, dosage], (err, results) => {
        if (err) {
          console.error('Error updating Stock_Inventory quantity:', err);
        }
      });
    }

    const tabletDetails = {
      tablets: billingData.medicineRows.map((row) => ({
        medicinename: row.medicinename,
        qty: row.qty,
        qtyprice: row.qtyprice,
        total: row.total,
      })),
    };

    const sql = `
      INSERT INTO Billing_Inventory
        (tabletdetails, subtotal, discount, grandtotal, patientname, doctorname, mobileno, cashgiven, balance, invoice_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
      JSON.stringify(tabletDetails),
      billingData.subtotal,
      billingData.discount,
      billingData.grandtotal,
      billingData.patientname,
      billingData.doctorname,
      billingData.mobileno,
      billingData.cashgiven,
      billingData.balance,
      invoicenumber,
    ], (err, result) => {
      if (err) throw err;      
      res.json({ message: 'Billing_Inventory data inserted successfully!', invoicenumber });
    });
  } catch (error) {
    console.error('Error processing billing data:', error);
    res.status(500).json({ error: 'Error processing billing data' });
  }
});

app.get('/billingdata', (req, res) => {
  const sql = 'SELECT * FROM `Billing_Inventory`'; // Added backtick at the end of table name
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
      return;
    }
    res.json(results);
  });
});

app.get('/allstock', (req, res) => {
  const { medicinename, dosage } = req.query;

  if (!medicinename) {
    res.status(400).json({ error: 'Medicine name is required' });
    return;
  }

  const sql = 'SELECT * FROM Stock_Inventory WHERE medicinename = ? AND dosage = ?';

  db.query(sql, [medicinename, dosage], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
      return;
    }

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
  const sql = 'SELECT * FROM Stock_Inventory';
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
    INSERT INTO Purchase_Inventory 
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
      console.error('Error inserting data into Purchase_Inventory table:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Data inserted into Purchase_Inventory table successfully');
      const selectStockQuery = 'SELECT * FROM Stock_Inventory WHERE medicinename = ? AND dosage = ?';

      db.query(selectStockQuery, [medicinename, dosage], (selectErr, selectResults) => {
        if (selectErr) {
          console.error('Error selecting from Stock_Inventory:', selectErr);
          res.status(500).send('Internal Server Error');
        } else if (selectResults.length > 0) {
          const existingQuantity = selectResults[0].totalqty;
          const updatedQuantity = existingQuantity + totalqty;

          const updateStockQuery = `
            UPDATE Stock_Inventory 
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
              console.error('Error updating Stock_Inventory:', updateErr);
              res.status(500).send('Internal Server Error');
            } else {
              console.log('Data updated in Stock_Inventory table successfully');
              res.status(200).send('Data updated in Stock_Inventory successfully');
            }
          });
        } else {
          const insertStockQuery = `
            INSERT INTO Stock_Inventory 
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
              console.error('Error inserting data in Stock_Inventory table:', errStock);
              res.status(500).send('Internal Server Error');
            } else {
              console.log('Data inserted into Stock_Inventory table successfully');
              res.status(200).send('Data inserted into Stock_Inventory successfully');
            }
          });
        }
      });
    }
  });
});

app.get('/allpurchase', (req, res) => {
  const sql = 'SELECT * FROM Purchase_Inventory';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
      return;
    }
    res.json(results);
  });
});


app.get('/quantity', (req, res) => {
  const { medicinename, dosage } = req.query;

  const selectQuantityQuery = 'SELECT totalqty FROM Stock_Inventory WHERE medicinename = ? AND dosage = ?';
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

  const selectMRPQuery = 'SELECT mrp FROM Stock_Inventory WHERE medicinename = ? AND dosage = ?';

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

app.get('/suggestions', (req, res) => {
  const partialName = req.query.partialName;
  console.log("name", partialName);

  if (!partialName) {
    res.status(400).json({ error: 'Partial name is required' });
    return;
  }

  const tabletSuggestionsQuery = 'SELECT medicinename, dosage FROM Stock_Inventory WHERE medicinename LIKE ?';
  const searchTerm = `%${partialName}%`; 

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


app.get('/billingdata/:invoice_number', (req, res) => {
  const { invoice_number } = req.params; // Extract the invoice_number parameter from the URL
  const sql = 'SELECT * FROM `Billing_Inventory` WHERE invoice_number = ?'; // Query to fetch data by invoice_number

  db.query(sql, [invoice_number], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).json({ error: 'Error fetching data' });
      return;
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
