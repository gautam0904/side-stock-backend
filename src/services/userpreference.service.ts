import UserPreferences, { IUserPreferences } from "../models/userPreference.model.js";
import { ERROR_MSG, MSG } from '../constants/message.js';
import { statuscode } from "../constants/status.js";
import { ApiError } from "../utils/apiError.js";

interface UserDocument {
    password?: string;
    [key: string]: any;
}

export class UserPreferenceService {
    async getPreferences(userId: string, tableName: string) {
        const preferences = await UserPreferences.findOne({ userId, tableName });

        if (!preferences) {
            throw new ApiError(statuscode.NOCONTENT, ERROR_MSG.NOT_FOUND('preferences'));
        }
        
        return {
            statuscode: statuscode.OK,
            message: MSG.SUCCESS('preferences fetched'),
            data: preferences
        };
    }

    async savePreferences(userId: string, tableName: string, columnVisibility: Record<string, boolean>) {
        if (!userId || userId == 'undefined') {
            throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.REQUIRED('userId'));
            
        }
        let preferences = await UserPreferences.findOne({ userId, tableName });
    
        if (!preferences) {
            // Directly assign the columnVisibility object (no need for Map)
            preferences = new UserPreferences({
                userId,
                tableName,
                columnVisibility: columnVisibility
            });
        } else {
            // Merge the existing columnVisibility with the new one (no Map here, just objects)
            const updatedColumnVisibility = {
                ...preferences.columnVisibility,
                ...columnVisibility
            };
    
            // Update the preferences with the merged object
            preferences.columnVisibility = updatedColumnVisibility;
        }
    
        // Save the preferences
        await preferences.save();
    
        return {
            statuscode: statuscode.CREATED,
            message: MSG.SUCCESS('preferences created'),
            data: preferences
        };
    }
    

    async updateSingleColumn(userId: string, tableName: string, columnName: string, visible: boolean) {
        const preferences = await UserPreferences.findOne({ userId });
        
        if (!preferences) return null;
      
        // Access as a regular object with bracket notation
        const key = `${tableName}:${columnName}`;
        (preferences.columnVisibility as any)[key] = visible;
        
        await preferences.save();
        return preferences;
    }

    async deleteTablePreferences(userId: string, tableName: string) {
        const preferences = await UserPreferences.findOne({ userId });
        if (!preferences) return;
      
        const prefix = `${tableName}:`;
        const prefObj = preferences.toObject();
        
        if (prefObj.columnVisibility) {
            const keysToDelete = Object.keys(prefObj.columnVisibility)
                .filter(key => key.startsWith(prefix));
                
            // Delete each key from the mongoose document
            keysToDelete.forEach(key => {
                (preferences.columnVisibility as any).delete(key);
            });
            
            await preferences.save();
        }
    }

    async deleteAllPreferences(userId: string) {
        await UserPreferences.deleteOne({ userId });
    }
}
