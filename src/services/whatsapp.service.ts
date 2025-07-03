import { ERROR_MSG } from '../constants/message.js';
import { statuscode } from "../constants/status.js";
import { ApiError } from "../utils/apiError.js";
import twilio from 'twilio';
import dotenv from 'dotenv';
import fs from 'fs';
import { deleteonCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

dotenv.config();

export class WhatsappService {
    private TWILIO_ACCOUNT_SID = '';
    private TWILIO_AUTH_TOKEN = '';
    private TWILIO_WHATSAPP_NUMBER = '';
    private twilioClient: twilio.Twilio;
    private SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:3031';
    pdfCloudinaryURL: string | null = null
    
    constructor() {
        this.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
        this.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
        this.TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '';

        this.twilioClient = new twilio.Twilio(this.TWILIO_ACCOUNT_SID, this.TWILIO_AUTH_TOKEN);
    }

    private formatPhoneNumber(phoneNumber: string): string {
        let cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.length === 10) {
            cleaned = '91' + cleaned;
        }
        return `whatsapp:+${cleaned}`;
    }

    async sendmessage(to: string, body: string, filePath?: string) {
        try {
            console.log(`Sending WhatsApp message to ${to}${filePath ? ' with attachment' : ''}`);
            
            if (!this.TWILIO_ACCOUNT_SID || !this.TWILIO_AUTH_TOKEN || !this.TWILIO_WHATSAPP_NUMBER) {
                throw new ApiError(statuscode.INTERNALSERVERERROR, "WhatsApp credentials are not configured");
            }
    
            const formattedNumber = this.formatPhoneNumber(to);
            console.log(`Formatted number: ${formattedNumber}`);
    
            // Initial message
            const textMessage = await this.twilioClient.messages.create({
                from: `whatsapp:${this.TWILIO_WHATSAPP_NUMBER}`,
                to: formattedNumber,
                body: "Your bill details are being prepared. You'll receive it shortly.",
            });
            
            console.log(`Text message sent with SID: ${textMessage.sid}`);
            
            let mediaMessage = null;
            let attachmentFailed = false;
    
            if (filePath && fs.existsSync(filePath)) {
                try {
                    // Upload to Cloudinary with specific settings for WhatsApp compatibility
                    const uploadResult = await uploadOnCloudinary(filePath, {
                        resource_type: 'raw',
                        format: 'pdf',
                        type: 'upload',
                        access_mode: 'public',
                        use_filename: true
                    });
                    
                    if (!uploadResult.success || !uploadResult.url) {
                        throw new Error('Failed to upload PDF to Cloudinary');
                    }
    
                    this.pdfCloudinaryURL = uploadResult.url;
                    console.log(`PDF uploaded to Cloudinary: ${this.pdfCloudinaryURL}`);
                    
                    // Make sure URL is properly accessible and has appropriate content type
                    // Twilio requires a publicly accessible URL with proper content type headers
                    const pdfUrl = this.pdfCloudinaryURL;
                    
                    // Verify URL is accessible before sending to Twilio
                    await this.verifyMediaUrl(pdfUrl);
                    
                    // Send with verified Cloudinary URL
                    mediaMessage = await this.twilioClient.messages.create({
                        from: `whatsapp:${this.TWILIO_WHATSAPP_NUMBER}`,
                        to: formattedNumber,
                        body: body || "Here is your bill (attached).",
                        mediaUrl: [pdfUrl]
                    });
                    
                    console.log(`PDF sent via Cloudinary with SID: ${mediaMessage.sid}`);
                } catch (error) {
                    console.error('File handling error:', error);
                    attachmentFailed = true;
                    
                    // Send message with link instead of attachment
                    const messageBody = `${body || "Here is your bill information."}${
                        this.pdfCloudinaryURL 
                            ? `\n\nDownload your bill here: ${this.pdfCloudinaryURL}` 
                            : '\n\nCould not attach file. Please contact support.'
                    }`;
                    
                    mediaMessage = await this.twilioClient.messages.create({
                        from: `whatsapp:${this.TWILIO_WHATSAPP_NUMBER}`,
                        to: formattedNumber,
                        body: messageBody
                    });
                    console.log(`Fallback message with link sent with SID: ${mediaMessage.sid}`);
                }
            }
    
            return {
                statuscode: statuscode.OK,
                message: 'WhatsApp message sent successfully!',
                twilioResponse: {
                    textMessageSid: textMessage.sid,
                    mediaMessageSid: mediaMessage?.sid,
                    pdfUrl: this.pdfCloudinaryURL,
                    attachmentFailed: attachmentFailed,
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
    
    // Helper method to verify that a URL is accessible before sending to Twilio
    private async verifyMediaUrl(url: string): Promise<boolean> {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            
            if (!response.ok) {
                throw new Error(`URL returned status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            console.log(`Media URL response: ${response.status}, Content-Type: ${contentType}`);
            
            // Twilio accepts these content types for WhatsApp
            const validTypes = [
                'application/pdf', 
                'image/jpeg', 
                'image/png', 
                'image/gif',
                'application/octet-stream'
            ];
            
            if (contentType && !validTypes.some(type => contentType.includes(type))) {
                console.warn(`Warning: Content-Type ${contentType} may not be accepted by Twilio for WhatsApp`);
            }
            
            return true;
        } catch (error) {
            console.error(`Failed to verify media URL ${url}:`, error);
            throw new Error(`Media URL verification failed: ${error.message}`);
        }
    }
}