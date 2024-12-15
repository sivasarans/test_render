// // routes/adduser.js
// const express = require('express');
// const pool = require('../config/db');
// const { img } = require('vamtec');

// const router = express.Router();

// router.post(
//   '/',
//   img(["uploads/users_profile", "timestamp", "profile_picture"]),
//   async (req, res) => {
//     const { name, email, role_id, user_id, role_name, password } = req.body;
//     if (!name || !email || !role_id || !user_id || !role_name || !password || !req.file)
//       return res.status(400).json({ error: 'All fields and profile picture are required' });

//     try {
//       const userExists = await pool.query('SELECT 1 FROM Users WHERE user_id = $1', [user_id]);
//       if (userExists.rows.length > 0)
//         return res.status(400).json({ error: 'User ID already exists' });

//       const query = `
//         INSERT INTO Users (name, email, role_id, user_id, role_name, password, profile_picture)
//         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
//       const values = [name, email, role_id, user_id, role_name, password, `/uploads/users_profile/${req.file.filename}`];
//       const result = await pool.query(query, values);

//       res.status(200).json({ message: 'User added successfully', userId: result.rows[0].id });
//     } catch (err) {
//       res.status(500).json({ error: 'Failed to process request' });
//     }
//   }
// );
// router.get('/',async ( req, res ) => {
//   try {
//     const query = 'SELECT * FROM Users';
//     const result = await pool.query(query);
//     res.status(200).json({message: "Success", result: result.rows});}
//     catch {
//       res.status(400).json({ message: "Failed to fetch users" });
//     }
// })

// module.exports = router;

const express = require('express');
const pool = require('../config/db');
const { img } = require('vamtec');
const router = express.Router();

// Add User - POST route
router.post(
  '/',
  img(["uploads/users_profile", "timestamp", "profile_picture"]),
  async (req, res) => {
    const { name, email, role_id, user_id, role_name, password } = req.body;
    if (!name || !email || !role_id || !user_id || !role_name || !password || !req.file)
      return res.status(400).json({ error: 'All fields and profile picture are required' });

    try {
      const userExists = await pool.query('SELECT 1 FROM Users WHERE user_id = $1', [user_id]);
      if (userExists.rows.length > 0)
        return res.status(400).json({ error: 'User ID already exists' });

      const query = `
        INSERT INTO Users (name, email, role_id, user_id, role_name, password, profile_picture)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
      const values = [name, email, role_id, user_id, role_name, password, `/uploads/users_profile/${req.file.filename}`];
      const result = await pool.query(query, values);

      res.status(200).json({ message: 'User added successfully', userId: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: 'Failed to process request' });
    }
  }
);

// Get All Users - GET route
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM Users';
    const result = await pool.query(query);
    res.status(200).json({ message: "Success", result: result.rows });
  } catch {
    res.status(400).json({ message: "Failed to fetch users" });
  }
});

// Update User - PUT route
router.put(
  '/:user_id',
  img(["uploads/users_profile", "timestamp", "profile_picture"]), // Optional: Only if updating profile picture
  async (req, res) => {
    const { name, email, role_id, role_name, password } = req.body;
    const { user_id } = req.params;
    const profile_picture = req.file ? `/uploads/users_profile/${req.file.filename}` : null;

    if (!name || !email || !role_id || !role_name || !password)
      return res.status(400).json({ error: 'All fields are required' });

    try {
      const userExists = await pool.query('SELECT 1 FROM Users WHERE user_id = $1', [user_id]);
      if (userExists.rows.length === 0)
        return res.status(404).json({ error: 'User not found' });

      // Update user
      const query = `
        UPDATE Users
        SET name = $1, email = $2, role_id = $3, role_name = $4, password = $5,
            profile_picture = COALESCE($6, profile_picture) 
        WHERE user_id = $7 RETURNING id`;
      const values = [name, email, role_id, role_name, password, profile_picture, user_id];
      const result = await pool.query(query, values);

      if (result.rowCount === 0)
        return res.status(400).json({ error: 'Failed to update user' });

      res.status(200).json({ message: 'User updated successfully', userId: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: 'Failed to process request' });
    }
  }
);

// Delete User - DELETE route
router.delete('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const userExists = await pool.query('SELECT 1 FROM Users WHERE user_id = $1', [user_id]);
    if (userExists.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    const query = 'DELETE FROM Users WHERE user_id = $1 RETURNING id';
    const result = await pool.query(query, [user_id]);

    if (result.rowCount === 0)
      return res.status(400).json({ error: 'Failed to delete user' });

    res.status(200).json({ message: 'User deleted successfully', userId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

module.exports = router;
