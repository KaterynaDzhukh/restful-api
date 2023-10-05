import pg from 'pg';
import express from 'express'
const usersRouter = express.Router();
import pool from '../pool.js';
import { body, validationResult } from 'express-validator';

const userValidation = [
  body('first_name').isString().notEmpty(),
  body('last_name').isString().notEmpty(),
  body('age').isInt({ min: 1 }),
];

console.log(process.env.PGUSER)
 
  pool.query('SELECT NOW()')
  .then(data => {
    console.log('data retrieved', data.rows[0]);
  })
  .catch(error => {
    console.error('Error connecting to the database:', error);
  });

// Get all users
usersRouter.get('/users', (req, res) => {
    pool.query('SELECT * FROM users', (err, result) => {
       if (err) {
         console.error('Error executing query', err);
         res.status(500).json({ error: 'Internal server error' });
       } else {
         res.json(result.rows);
       }
     });
   });
  

  // Get orders for a specific user by user_id
usersRouter.get('/users/:userId/orders', (req, res) => {
    const userId = req.params.userId;
  
    pool.query('SELECT * FROM orders WHERE user_id = $1', [userId], (err, result) => {
      if (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(result.rows);
      }
    });
  });
  

  // Create a new user
usersRouter.post('/users', userValidation, (req, res, next) => {
    const { first_name, last_name, age, active } = req.body;
    const errors = validationResult(req);
  
    if (!first_name || !last_name || !age || active === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
      }
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
      pool.query(
        'INSERT INTO users (first_name, last_name, age, active) VALUES ($1, $2, $3, $4) RETURNING *',
        [first_name, last_name, age, active],
        (err, result) => {
          if (err) {
            return next(err);
          }
          res.status(201).json(result.rows[0]);
        }
      );
    });


    usersRouter.get('/:id', (req, res, next) => {
      const userId = req.params.id;
    
      pool.query('SELECT * FROM users WHERE id = $1', [userId], (err, result) => {
        if (err) {
          return next(err);
        }
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
      });
    });



    usersRouter.put("/:id", async (req, res) => {
      const {first_name, last_name} = req.body;
      const userId = req.params.id;
  
      let setClauses = [];
      let values = [];
      
      if (first_name !== undefined) {
          setClauses.push(`first_name = $${values.length + 1}`);
          values.push(first_name);
      }
      
      if (last_name !== undefined) {
          setClauses.push(`last_name = $${values.length + 1}`);
          values.push(last_name);
      }
  
      if (!setClauses.length) {
          return res.status(400).json({ message: "No fields provided to update" });
      }
  
      values.push(userId);
      
      const query = `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`;
      console.log(query, 'query')
      try {
          const {rows} = await pool.query(query, values);
          if (!rows.length) {
              return res.status(404).json({ message: "User not found" });
          }
          res.json(rows[0]);
      } catch(err) {
          res.status(500).json({ message: "Internal server error", error: err.message });
      }
  });
  
  
  usersRouter.delete("/:id", async (req, res) => {
    const userId = req.params.id;
  
    try {
        const {rows} = await pool.query('DELETE FROM users WHERE id=$1;', [userId]);
        res.json({ message: 'User deleted successfully', data: rows[0] });

    } catch(err){
        res.status(500).json(err)
    }
})

usersRouter.put("/:id/check-inactive", async (req, res) => {
  const userId = req.params.id;
  
  try {
      const orders = await pool.query('SELECT * FROM orders WHERE user_id=$1;', [userId]);
      if (orders.rows.length === 0) {
          const { rows } = await pool.query('UPDATE users SET active=false WHERE id=$1 RETURNING *;', [id]);
          res.json(rows[0]);
      } else {
          res.status(400).json({ message: "User has orders, cannot set to inactive" });
      }
  } catch (err) {
      res.status(500).json({ message: "Internal server error", error: err.message });
  }
});
    

  export default usersRouter;