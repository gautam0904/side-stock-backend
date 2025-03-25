import { ERROR_MSG } from '../constants/message.js';
import { statuscode } from "../constants/status.js";
import { ApiError } from "../utils/apiError.js";
import twilio from 'twilio';
import dotenv from 'dotenv';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

dotenv.config();

export class WhatsappService {
    private TWILIO_ACCOUNT_SID = '';
    private TWILIO_AUTH_TOKEN = '';
    private TWILIO_WHATSAPP_NUMBER = '';
    private twilioClient: twilio.Twilio;
    private IMGUR_CLIENT_ID = 'fb49a6063167315'; // Free anonymous Imgur API client ID
    
    constructor() {
        this.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
        this.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
        this.TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '';

        // Set up Twilio client
        this.twilioClient = new twilio.Twilio(this.TWILIO_ACCOUNT_SID, this.TWILIO_AUTH_TOKEN);
    }

    private formatPhoneNumber(phoneNumber: string): string {
        let cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.length === 10) {
            cleaned = '91' + cleaned;
        }
        return `whatsapp:+${cleaned}`;
    }

    // Simple PDF to JPG conversion using ImageMagick (must be installed)
    private async convertPdfToJpg(pdfPath: string): Promise<string> {
        try {
            const outputPath = pdfPath.replace('.pdf', '.jpg');
            
            // Use ImageMagick to convert PDF to JPG (first page only)
            await execAsync(`magick convert -density 150 -quality 90 "${pdfPath}[0]" "${outputPath}"`);
            
            if (fs.existsSync(outputPath)) {
                console.log(`PDF converted to JPG: ${outputPath}`);
                return outputPath;
            }
            
            throw new Error('Conversion failed - output file not found');
        } catch (error) {
            console.error('PDF to JPG conversion error:', error);
            
            // Fallback: if ImageMagick fails, try with another approach
            // (This is just a placeholder - you would need to implement alternative conversion)
            throw new Error('Failed to convert PDF to JPG');
        }
    }
    
    // Upload image to Imgur (free, reliable image hosting)
    private async uploadToImgur(imagePath: string): Promise<string> {
        try {
            const imageData = fs.readFileSync(imagePath);
            
            const formData = new FormData();
            formData.append('image', imageData);
            
            const response = await axios.post('https://api.imgur.com/3/image', formData, {
                headers: {
                    Authorization: `Client-ID ${this.IMGUR_CLIENT_ID}`,
                    ...formData.getHeaders()
                }
            });
            
            if (response.data && response.data.success && response.data.data && response.data.data.link) {
                console.log(`Image uploaded to Imgur: ${response.data.data.link}`);
                return response.data.data.link;
            } else {
                throw new Error('Imgur upload failed');
            }
        } catch (error) {
            console.error('Imgur upload error:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }

    async sendmessage(to: string, body: string, filePath?: string) {
        try {
            console.log(`Sending WhatsApp message to ${to}`);
            
            if (!this.TWILIO_ACCOUNT_SID || !this.TWILIO_AUTH_TOKEN || !this.TWILIO_WHATSAPP_NUMBER) {
                throw new ApiError(statuscode.INTERNALSERVERERROR, "WhatsApp credentials are not configured");
            }

            // Format the phone number
            const formattedNumber = this.formatPhoneNumber(to);
            console.log(`Formatted number: ${formattedNumber}`);

            // Send initial message
            const textMessage = await this.twilioClient.messages.create({
                from: `whatsapp:${this.TWILIO_WHATSAPP_NUMBER}`,
                to: formattedNumber,
                body: "Your bill details are being prepared. You'll receive it shortly.",
            });
            
            console.log(`Text message sent with SID: ${textMessage.sid}`);
            
            // Handle PDF if provided
            let mediaMessage = null;
            let imageUrl = null;
            
            if (filePath && fs.existsSync(filePath)) {
                try {
                    // Step 1: Convert PDF to JPG
                    let jpgPath;
                    try {
                        jpgPath = await this.convertPdfToJpg(filePath);
                    } catch (conversionError) {
                        console.error('PDF conversion failed:', conversionError);
                        jpgPath = null;
                    }
                    
                    // Step 2: Upload JPG to Imgur
                    if (jpgPath) {
                        try {
                            imageUrl = await this.uploadToImgur(jpgPath);
                        } catch (uploadError) {
                            console.error('Image upload failed:', uploadError);
                        }
                        
                        // Clean up temporary JPG file
                        try {
                            fs.unlinkSync(jpgPath);
                        } catch (cleanupError) {
                            console.warn('Failed to clean up temporary file:', cleanupError);
                        }
                    }
                    
                    // Step 3: Send image via WhatsApp
                    if (imageUrl) {
                        mediaMessage = await this.twilioClient.messages.create({
                            from: `whatsapp:${this.TWILIO_WHATSAPP_NUMBER}`,
                            to: formattedNumber,
                            body: body || "Here is your bill.",
                            mediaUrl: [imageUrl]
                        });
                        
                        console.log(`Image message sent with SID: ${mediaMessage.sid}`);
                    } else {
                        // Send just a text if image upload failed
                        mediaMessage = await this.twilioClient.messages.create({
                            from: `whatsapp:${this.TWILIO_WHATSAPP_NUMBER}`,
                            to: formattedNumber,
                            body: `${body || "Here is your bill information."}\n\nUnfortunately we couldn't attach the PDF. Please contact our support team.`
                        });
                        
                        console.log(`Fallback text message sent with SID: ${mediaMessage.sid}`);
                    }
                } catch (fileError) {
                    console.error('PDF handling error:', fileError);
                }
            }

            return {
                statuscode: statuscode.OK,
                message: 'WhatsApp message sent successfully!',
                twilioResponse: {
                    textMessageSid: textMessage.sid,
                    mediaMessageSid: mediaMessage?.sid,
                    imageUrl: imageUrl,
                    status: textMessage.status || 'sent'
                }
            };
        } catch (error) {
            console.error('WhatsApp error:', error);
            throw new ApiError(
                error.statuscode || statuscode.INTERNALSERVERERROR, 
                error.message || ERROR_MSG.DEFAULT_ERROR
            );
        }
    }
}
