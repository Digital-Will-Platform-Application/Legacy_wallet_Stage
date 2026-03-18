import express from 'express';
import pool from '../config/database.js';
import { ensureUserExists } from '../utils/userHelper.js';
import { sendAssetNotificationEmail } from '../services/emailService.js';

const router = express.Router();

// Middleware to extract user ID
const authenticateUser = async (req, res, next) => {
  try {
    // Accept either user_id or user_email
    const userId = req.body.user_id || req.query.user_id;
    const userEmail = req.body.user_email || req.query.user_email;
    
    // If we have user_id, use it directly
    if (userId) {
      req.userId = parseInt(userId);
      req.userEmail = null;
      return next();
    }
    
    // If we have user_email, ensure user exists (auto-create if needed)
    if (userEmail) {
      try {
        const userId = await ensureUserExists(userEmail);
        req.userId = userId;
        req.userEmail = userEmail;
        return next();
      } catch (error) {
        console.error('Error ensuring user exists:', error);
        return res.status(500).json({
          success: false,
          message: 'Error creating user account'
        });
      }
    }
    
    // Neither provided
    return res.status(400).json({
      success: false,
      message: 'User ID or email is required'
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Add asset
router.post('/add', authenticateUser, async (req, res) => {
  try {
    const { name, category, estimated_value, description, currency } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Asset name is required'
      });
    }

    // Use userId from middleware (already looked up)
    const userId = req.userId;

    // Validate estimated_value if provided
    let estimatedValue = null;
    if (estimated_value) {
      const numValue = parseFloat(estimated_value);
      if (isNaN(numValue) || numValue < 0) {
        return res.status(400).json({
          success: false,
          message: 'Estimated value must be a positive number'
        });
      }
      estimatedValue = numValue;
    }

    const result = await pool.query(
      `INSERT INTO assets (user_id, name, category, estimated_value, description, currency)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, name, category, estimated_value, description, currency, created_at, updated_at`,
      [userId, name.trim(), category || 'other', estimatedValue, description?.trim() || null, currency || 'USD']
    );

    const asset = result.rows[0];

    // Send email notifications to all recipients with email addresses
    try {
      // Get creator name
      const userResult = await pool.query(
        'SELECT username, email FROM users WHERE id = $1',
        [userId]
      );
      const creatorName = userResult.rows[0]?.username || 'the will creator';

      // Get all recipients with email addresses
      const recipientsResult = await pool.query(
        'SELECT email, full_name FROM recipients WHERE user_id = $1 AND email IS NOT NULL AND email != \'\'',
        [userId]
      );

      // Send notifications to all recipients
      const emailPromises = recipientsResult.rows.map(recipient =>
        sendAssetNotificationEmail(
          recipient.email,
          recipient.full_name,
          asset.name,
          asset.estimated_value,
          asset.description,
          creatorName
        )
      );

      const emailResults = await Promise.allSettled(emailPromises);
      const sentCount = emailResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
      
      if (sentCount > 0) {
        console.log(`✅ Sent ${sentCount} asset notification email(s)`);
      }
    } catch (emailError) {
      console.error('Error sending asset notification emails:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Asset added successfully',
      data: asset
    });
  } catch (error) {
    console.error('Error adding asset:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding asset',
      error: error.message
    });
  }
});

// Get all assets for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT id, user_id, name, category, estimated_value, description, currency, documents_url, created_at, updated_at
       FROM assets 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assets',
      error: error.message
    });
  }
});

// Get assets by user email
router.get('/user-email/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    const userId = await ensureUserExists(userEmail);
    
    const result = await pool.query(
      `SELECT id, user_id, name, category, estimated_value, description, currency, documents_url, created_at, updated_at
       FROM assets 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assets',
      error: error.message
    });
  }
});

// Get asset by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, user_id, name, category, estimated_value, description, currency, documents_url, created_at, updated_at
       FROM assets 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching asset',
      error: error.message
    });
  }
});

// Delete asset
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await pool.query(
      'DELETE FROM assets WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting asset',
      error: error.message
    });
  }
});

export default router;
