import express from 'express';
import pool from '../config/database.js';
import { ensureUserExists } from '../utils/userHelper.js';
import { sendRecipientAddedEmail } from '../services/emailService.js';

const router = express.Router();

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

// Add a new recipient
router.post('/add', authenticateUser, async (req, res) => {
  try {
    const { full_name, email, phone, relationship, address } = req.body;
    const userId = req.userId;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    const result = await pool.query(
      `INSERT INTO recipients (user_id, full_name, email, phone, relationship, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        full_name.trim(),
        email?.trim() || null,
        phone?.trim() || null,
        relationship || null,
        address || null
      ]
    );

    const recipient = result.rows[0];

    // Send email notification if email is provided
    if (email && email.trim()) {
      try {
        // Get creator name
        const userResult = await pool.query(
          'SELECT username, email FROM users WHERE id = $1',
          [userId]
        );
        const creatorName = userResult.rows[0]?.username || 'the will creator';

        const emailResult = await sendRecipientAddedEmail(
          email.trim(),
          full_name.trim(),
          creatorName
        );

        if (emailResult.success) {
          console.log(`✅ Recipient added email sent to ${email}`);
        } else {
          console.warn(`⚠️ Failed to send recipient added email: ${emailResult.error}`);
        }
      } catch (emailError) {
        console.error('Error sending recipient added email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Recipient added successfully',
      data: recipient
    });
  } catch (error) {
    console.error('Error adding recipient:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding recipient',
      error: error.message
    });
  }
});

// Get all recipients for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT id, user_id, full_name, email, phone, relationship, address, is_verified, image_url, created_at, updated_at
       FROM recipients
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
    console.error('Error fetching recipients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recipients',
      error: error.message
    });
  }
});

// Get recipients by user email
router.get('/user-email/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    const userId = await ensureUserExists(userEmail);
    
    const result = await pool.query(
      `SELECT id, user_id, full_name, email, phone, relationship, address, is_verified, image_url, created_at, updated_at
       FROM recipients
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
    console.error('Error fetching recipients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recipients',
      error: error.message
    });
  }
});

// Update a recipient
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, relationship, address } = req.body;
    const userId = req.userId;

    const result = await pool.query(
      `UPDATE recipients
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           relationship = COALESCE($4, relationship),
           address = COALESCE($5, address),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        full_name?.trim() || null,
        email?.trim() || null,
        phone?.trim() || null,
        relationship || null,
        address || null,
        id,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipient updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating recipient:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating recipient',
      error: error.message
    });
  }
});

// Delete a recipient
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      'DELETE FROM recipients WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipient deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recipient:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting recipient',
      error: error.message
    });
  }
});

export default router;
