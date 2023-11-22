const client = require('twilio')('ACaf14b461bd9d421588258c2fb38ec6eb', '022b1c1f00a506421e07801205bcea1f');


app.post('/send-pdf', async (req, res) => {
  const { to, pdfUrl, message } = req.body;

  console.log('Recipient WhatsApp Number:', to); // Check the recipient's WhatsApp number
  console.log('PDF URL:', pdfUrl); // Check the PDF URL
  console.log('Message:', message); // Check the message content

  try {
    await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Remove the trailing dot from the Twilio WhatsApp number
      to: `whatsapp:${to}`,
      mediaUrl: pdfUrl,
    });

    res.send('PDF sent successfully');
  } catch (error) {
    console.error('Error sending PDF:', error);
    res.status(500).send('Error sending PDF');
  }
});



// const convertToTwilioWhatsAppNumber = (countryCode, mobileNo) => {
  //   // Format the mobile number to E.164 format (e.g., +1234567890)
  //   const formattedNumber = `${countryCode}${mobileNo}`;
  //   // Twilio expects phone numbers in the E.164 format
  //   return formattedNumber;
  // };

  // const handleWhatsApp = async () => {
  //   // Make a request to your backend endpoint responsible for generating the PDF and sending via Twilio
  //   try {

  //     const generatedPdf = await handlePdf();

  //     if (generatedPdf) {

  //       const twilioWhatsAppNumber = convertToTwilioWhatsAppNumber(countryCode, mobileNo);

  //       const response = await axios.post('http://localhost:3000/send-pdf', {
  //         to: twilioWhatsAppNumber, // Replace with the recipient's phone number
  //         pdfUrl: generatedPdf, // Use the generated PDF data URL
  //         message: 'Check out your bill!', // Custom message for the WhatsApp
  //       });
  //       console.log('PDF sent successfully:', response.data);

  //     } else {
  //       console.error('PDF generation failed.');
  //       // Handle PDF generation failure
  //     }
  //     // Optionally show a success message or perform other actions upon successful sending
  //   } catch (error) {
  //     console.error('Error sending PDF:', error);
  //     // Handle errors or show error messages
  //   }
  // };
