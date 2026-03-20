import express from 'express';
import multer from 'multer';
import { ensureUserExists } from '../utils/userHelper.js';
import { uploadAudioRecording, uploadVideoRecording, isR2Configured, getPublicUrl } from '../services/r2Storage.js';
import pool from '../config/database.js';

const router = express.Router();

// Configure multer for memory storage (we'll upload directly to R2)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  },
});

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.query.user_id;
    const userEmail = req.body.user_email || req.query.user_email;

    if (userId) {
      req.userId = parseInt(userId);
      req.userEmail = null;
      return next();
    }

    if (userEmail) {
      try {
        const userId = await ensureUserExists(userEmail);
        req.userId = userId;
        req.userEmail = userEmail;
        return next();
      } catch (error) {
        console.error('Error ensuring user exists:', error);
        return res.status(500).json({ success: false, message: 'Error creating user account' });
      }
    }

    return res.status(400).json({ success: false, message: 'User ID or email is required' });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

// Upload audio recording
router.post('/audio', upload.single('audio'), authenticateUser, async (req, res) => {
  try {
    if (!isR2Configured()) {
      return res.status(500).json({
        success: false,
        message: 'R2 storage is not configured. Please configure R2 credentials in environment variables.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    // Check if userId was set by authenticateUser middleware
    if (!req.userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or email is required. Please provide user_email in the request.'
      });
    }

    const userId = req.userId;
    const useStaging = req.body.staging === 'true' || process.env.NODE_ENV !== 'production';

    // Upload to R2
    console.log(`Uploading audio: userId=${userId}, fileSize=${req.file.size}, staging=${useStaging}`);
    let uploadResult;
    try {
      uploadResult = await uploadAudioRecording(
        req.file.buffer,
        userId,
        useStaging
      );
      console.log('R2 upload successful:', uploadResult);
    } catch (uploadError) {
      console.error('R2 upload failed:', uploadError);
      console.error('Error details:', {
        message: uploadError.message,
        stack: uploadError.stack,
        name: uploadError.name
      });
      throw uploadError;
    }

    // Update or create will record in database
    const existingCheck = await pool.query(
      'SELECT id FROM wills WHERE user_id = $1 AND type = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, 'audio']
    );

    let will;
    if (existingCheck.rows.length > 0) {
      // Update existing will
      const result = await pool.query(
        `UPDATE wills 
         SET audio_url = $1, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, user_id, title, type, status, audio_url, created_at, updated_at`,
        [uploadResult.url, existingCheck.rows[0].id]
      );
      will = result.rows[0];
    } else {
      // Create new will
      const result = await pool.query(
        `INSERT INTO wills (user_id, title, type, audio_url, status)
         VALUES ($1, $2, $3, $4, 'in_progress')
         RETURNING id, user_id, title, type, status, audio_url, created_at, updated_at`,
        [userId, 'My Audio Will', 'audio', uploadResult.url]
      );
      will = result.rows[0];
    }

    res.json({
      success: true,
      message: 'Audio uploaded successfully',
      data: {
        will,
        upload: uploadResult
      }
    });
  } catch (error) {
    console.error('Error uploading audio:', error);
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    res.status(500).json({
      success: false,
      message: `Error uploading audio: ${error.message || 'Unknown error'}`,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Upload video recording
router.post('/video', upload.single('video'), authenticateUser, async (req, res) => {
  try {
    if (!isR2Configured()) {
      return res.status(500).json({
        success: false,
        message: 'R2 storage is not configured. Please configure R2 credentials in environment variables.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    // Check if userId was set by authenticateUser middleware
    if (!req.userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or email is required. Please provide user_email in the request.'
      });
    }

    const userId = req.userId;
    const useStaging = req.body.staging === 'true' || process.env.NODE_ENV !== 'production';

    // Upload to R2
    const uploadResult = await uploadVideoRecording(
      req.file.buffer,
      userId,
      useStaging
    );

    // Update or create will record in database
    const existingCheck = await pool.query(
      'SELECT id FROM wills WHERE user_id = $1 AND type = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, 'video']
    );

    let will;
    if (existingCheck.rows.length > 0) {
      // Update existing will
      const result = await pool.query(
        `UPDATE wills 
         SET video_url = $1, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, user_id, title, type, status, video_url, created_at, updated_at`,
        [uploadResult.url, existingCheck.rows[0].id]
      );
      will = result.rows[0];
    } else {
      // Create new will
      const result = await pool.query(
        `INSERT INTO wills (user_id, title, type, video_url, status)
         VALUES ($1, $2, $3, $4, 'in_progress')
         RETURNING id, user_id, title, type, status, video_url, created_at, updated_at`,
        [userId, 'My Video Will', 'video', uploadResult.url]
      );
      will = result.rows[0];
    }

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        will,
        upload: uploadResult
      }
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: error.message
    });
  }
});

// Get upload status/info
router.get('/status', (req, res) => {
  res.json({
    success: true,
    r2Configured: isR2Configured(),
    message: isR2Configured() 
      ? 'R2 storage is configured and ready' 
      : 'R2 storage is not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY'
  });
});

export default router;
