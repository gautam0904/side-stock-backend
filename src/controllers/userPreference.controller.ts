import { Request, Response } from 'express';
import { UserPreferenceService } from '../services/userpreference.service.js';
import { ApiError } from '../utils/apiError.js';
import { statuscode } from '../constants/status.js';
import { ERROR_MSG, MSG } from '../constants/message.js';

const userPreferenceService = new UserPreferenceService();

export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const tableName = req.params.tableName;
    const preferences = await userPreferenceService.getPreferences(userId, tableName);
    res.status(preferences.statuscode).json(preferences);
  } catch (error) {
    res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
  }
};

export const saveUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const tableName = req.params.tableName;

    if (!userId) {
      throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.REQUIRED('userId'));
    }

    // Directly assign req.body to preferences (if it's an object)
    const preferences = req.body;

    if (!preferences || typeof preferences !== 'object') {
      throw new ApiError(statuscode.BADREQUEST, ERROR_MSG.REQUIRED('preferences'));
    }

    const result = await userPreferenceService.savePreferences(userId, tableName, preferences.preferences);

    return res.status(result.statuscode).json(result);
  } catch (error) {
    res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || ERROR_MSG.DEFAULT_ERROR, data: error });
  }
};


// export const getPreferenceByKey = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?._id || 'default';
//     const key = req.params.key;

//     if (!key) {
//       return res.status(statuscode.BADREQUEST).json(
//         new ApiError(statuscode.BADREQUEST, ERROR_MSG.REQUIRED('key'))
//       );
//     }

//     const preferences = await userPreferenceService.getPreferences(userId, key);

//     return res.status(preferences.statuscode).json(preferencesz);
//   } catch (error) {
//     return res.status(statuscode.INTERNALSERVERERROR).json(
//       new ApiError(statuscode.INTERNALSERVERERROR, ERROR_MSG.DEFAULT_ERROR)
//     );
//   }
// };

// export const savePreferenceByKey = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?._id || 'default';
//     const key = req.params.key;
//     const { value } = req.body;

//     if (!key || value === undefined) {
//       return res.status(statuscode.BADREQUEST).json(
//         new ApiError(statuscode.BADREQUEST, ERROR_MSG.REQUIRED('key and value'))
//       );
//     }

//     const result = await userPreferenceService.savePreferences(userId, key, value);

//     return res.status(result.statucode).json(result);

//   } catch (error) {
//     return res.status(statuscode.INTERNALSERVERERROR).json(
//       new ApiError(statuscode.INTERNALSERVERERROR, ERROR_MSG.DEFAULT_ERROR)
//     );
//   }
// }; 