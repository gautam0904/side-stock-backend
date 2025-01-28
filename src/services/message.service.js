
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

// Get credentials from environment variables
const client = twilio('ACca94f108736b0ccb28bf0f11b392740','78811559518d5e1399a2f76c05462c35');

// Function to send WhatsApp message with file
async function sendWhatsAppMessageWithFile(to, message, mediaUrl) {
  try {
    const response = await client.messages.create({
      body: message, // Message text
      from: 'whatsapp:+14155238886', // Twilio WhatsApp sandbox number (replace if using a production number)
      to: `whatsapp:${to}`, // Recipient's WhatsApp number
      mediaUrl: [mediaUrl], // URL of the file to send
    });

    console.log('Message sent successfully!', response.sid);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Example usage
const recipientNumber = '+919904038740'; // Replace with recipient's WhatsApp number
const message = 'Hello! Here is the file you requested.';
// Make sure the media URL is publicly accessible
const fileUrl = 'https://example.com/your-file.pdf'; // Replace with a valid file URL

sendWhatsAppMessageWithFile(recipientNumber, message, fileUrl);
