const express = require('express');
const pool = require('../config/db'); // Importing database connection pool
const router = express.Router();

// Get all leave data
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leave_data');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching leave data');
  }
});

    router.put('/admin/:user_id', async (req, res) => {
        const { user_id } = req.params;
        const { EL, SL, CL, CO, SO, SML, ML, CW, OOD, HL, COL, WFH, WO, MP, A } = req.body;
    
        try {
        const result = await pool.query(
            `UPDATE leave_data SET EL = $1, SL = $2, CL = $3, CO = $4, SO = $5, SML = $6, 
            ML = $7, CW = $8, OOD = $9, HL = $10, COL = $11, WFH = $12, WO = $13, MP = $14, A = $15
            WHERE user_id = $16`,
            [EL, SL, CL, CO, SO, SML, ML, CW, OOD, HL, COL, WFH, WO, MP, A, user_id]
        );
        res.status(200).json({ message: 'Leave data updated successfully', data: result.rows });
        } catch (err) {
        console.error(err);
        res.status(500).send('Error updating leave data');
        }
    });


  router.post('/apply_leave', async (req, res) => {
    const { user_id, user_name, leave_type, from_date, to_date, leave_days, reason } = req.body;
  
    // Ensure all necessary fields are provided
    if (!user_id || !user_name || !leave_type || !from_date || !to_date || !leave_days || !reason) {
      return res.status(400).send('All fields are required');
    }
  
    try {
      // Insert leave application data into the database
      const result = await pool.query(
        `INSERT INTO leave_applications (user_id, user_name, leave_type, from_date, to_date, leave_days, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending') RETURNING *`,
        [user_id, user_name, leave_type, from_date, to_date, leave_days, reason]
      );
  
      // Return the inserted leave application
      res.status(201).json({ message: 'Leave application submitted successfully', data: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error applying for leave');
    }
  });
  

  // router.put('/reduce_leave_balance', async (req, res) => {
  //   const { user_id, leave_type, leave_days } = req.body;
  
  //   // Ensure required fields are provided
  //   if (!user_id || !leave_type || !leave_days) {
  //     return res.status(400).send('User ID, leave type, and leave days are required');
  //   }
  
  //   try {
  //     // Update the leave balance by reducing the leave days
  //     const result = await pool.query(
  //       `UPDATE leave_data SET "${leave_type}" = "${leave_type}" - $1 
  //        WHERE user_id = $2 AND "${leave_type}" >= $1 
  //        RETURNING "${leave_type}"`, 
  //       [leave_days, user_id]
  //     );
  
  //     if (result.rows.length === 0) {
  //       return res.status(400).send('Insufficient leave balance or user not found');
  //     }
  
  //     const updatedBalance = result.rows[0][leave_type];  // Extract the updated leave balance
  
  //     res.status(200).json({
  //       message: `${leave_type} balance updated successfully. New balance: ${updatedBalance}`,
  //       data: { [leave_type]: updatedBalance },
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).send('Error reducing leave balance');
  //   }
  // });


  router.put('/reduce_leave_balance', async (req, res) => {
    const { user_id, leave_type, leave_days } = req.body;
  
    // Ensure required fields are provided
    if (!user_id || !leave_type || !leave_days) {
      return res.status(400).send('User ID, leave type, and leave days are required');
    }
  
    try {
      // Update the leave balance by reducing the leave days
      const result = await pool.query(
        `UPDATE leave_data SET "${leave_type}" = "${leave_type}" - $1 
         WHERE user_id = $2 AND "${leave_type}" >= $1 
         RETURNING "${leave_type}"`, 
        [leave_days, user_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(400).send('Insufficient leave balance or user not found');
      }
  
      const updatedBalance = result.rows[0][leave_type];  // Extract the updated leave balance
  
      res.status(200).json({
        message: `${leave_type} balance updated successfully. New balance: ${updatedBalance}`,
        data: { [leave_type]: updatedBalance },
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error reducing leave balance');
    }
  });
  

  router.get('/get/leave-applications', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM leave_applications ORDER BY applied_date DESC');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.put('/put/leave-applications/:id', async (req, res) => {
    const { id } = req.params; // Extract 'id' from route parameters
    const { status, reject_reason } = req.body; // Extract 'status' and 'reject_reason' from request body
    
    try {
      const result = await pool.query(
        'UPDATE leave_applications SET status = $1, reject_reason = $2 WHERE id = $3',
        [status, reject_reason || '', id]
      );
  
      if (result.rowCount === 0) {
        // If no rows were updated, send a 404 response
        return res.status(404).send('Leave application not found or no changes made');
      }
  
      res.send('Leave status updated successfully'); // Success response
    } catch (error) {
      console.error('Error updating leave status:', error); // Log any error
      res.status(500).send('Internal Server Error'); // Error response
    }
  });

  router.delete('/delete-leaverequest/:id', async (req, res) => {
    const { id } = req.params; // Extract the leave application ID from the route parameters
  
    try {
      const result = await pool.query('DELETE FROM leave_applications WHERE id = $1 RETURNING *', [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).send('Leave application not found'); // If no rows were deleted, send a 404 response
      }
  
      res.status(200).json({ message: 'Leave application deleted successfully', data: result.rows[0] }); // Return success response
    } catch (error) {
      console.error('Error deleting leave application:', error); // Log any errors
      res.status(500).send('Internal Server Error'); // Send error response
    }
  });
  


module.exports = router;
