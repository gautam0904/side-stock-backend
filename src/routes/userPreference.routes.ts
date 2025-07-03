import { Router } from 'express';
import { 
  getUserPreferences, 
  saveUserPreferences,
} from '../controllers/userPreference.controller.js';

const router = Router();

router.get('/:id/:tableName', getUserPreferences);

router.post('/:id/:tableName', saveUserPreferences);

// // Get a specific user preference by key
// router.get('/:key', getPreferenceByKey);

// // Save a specific user preference by key
// router.post('/:key', savePreferenceByKey);

export default router; 