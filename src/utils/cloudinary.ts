import cloudinary from 'cloudinary';
import fs from 'fs';

cloudinary.v2.config({
  cloud_name: 'dmnwvonzf',
  api_key: '321296846966243',
  api_secret: 'u1n81YsmueJJb6v2tVJYcH_H2WE'
});


export const uploadOnCloudinary = async (localFilePath: string, options: any = {}) => {
  try {
    if (!localFilePath) return { success: false, message: "No file path provided" };
    
    if (!fs.existsSync(localFilePath)) {
      return { success: false, message: "File does not exist" };
    }

    const defaultOptions = {
      resource_type: "raw",
      format: "pdf",
      type: "upload",
      access_mode: "public"
    };

    const uploadOptions = { ...defaultOptions, ...options };
    
    console.log(`Uploading to Cloudinary with options:`, uploadOptions);
    const response = await cloudinary.v2.uploader.upload(localFilePath, uploadOptions);
    
    console.log("Cloudinary upload response:", {
      public_id: response.public_id,
      url: response.secure_url,
      format: response.format,
      resource_type: response.resource_type
    });

    return {
      success: true,
      message: "File uploaded successfully",
      public_id: response.public_id,
      url: response.secure_url
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      message: error.message || "Failed to upload to Cloudinary",
      error
    };
  }
};

export const deleteonCloudinary = async (publicId: string) => {
  try {
    if (!publicId) return { success: false, message: "No public ID provided" };
    
    const response = await cloudinary.v2.uploader.destroy(publicId);
    
    return {
      success: response.result === "ok",
      message: response.result === "ok" ? "File deleted successfully" : "Failed to delete file"
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete from Cloudinary",
      error
    };
  }
};