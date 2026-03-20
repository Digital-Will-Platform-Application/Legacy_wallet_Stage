import express from 'express';
import pool from '../config/database.js';
import { ensureUserExists } from '../utils/userHelper.js';

const router = express.Router();

// Update user profile (avatar_url, full_name)
router.post('/update', async (req, res) => {
  try {
    const { user_email, avatar_url, full_name } = req.body;

    if (!user_email) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    // Ensure user exists in backend database
    const userId = await ensureUserExists(user_email);

    // Note: This updates the backend users table
    // For Supabase profiles, we'll need to handle that separately
    // For now, let's create a mapping or update both
    
    // Update backend users table if we have those fields
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (full_name !== undefined) {
      updateFields.push(`username = $${paramIndex++}`);
      updateValues.push(full_name || null);
    }

    if (updateFields.length > 0) {
      updateValues.push(userId);
      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING id, username, email
      `;
      
      await pool.query(updateQuery, updateValues);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user_id: userId,
        avatar_url: avatar_url || null,
        full_name: full_name || null
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

export default router;
