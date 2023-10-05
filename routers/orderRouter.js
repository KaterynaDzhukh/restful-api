import pg from 'pg';
import express from 'express'
const {Pool} = pg;
const orderRouter = express.Router();


// GET all orders
orderRouter.get('/orders', (req, res, next) => {
    pool.query('SELECT * FROM orders', (err, result) => {
      if (err) {
        return next(err);
      }
      res.json(result.rows);
    });
  });
  
  // GET one order by ID
  orderRouter.get('/orders/:id', (req, res, next) => {
    const orderId = req.params.id;
    pool.query('SELECT * FROM orders WHERE id = $1', [orderId], (err, result) => {
      if (err) {
        return next(err);
      }
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(result.rows[0]);
    });
  });
  
  // POST - Create a new order
  orderRouter.post('/orders', (req, res, next) => {
    const { price, date, user_id } = req.body;
  
    if (!price || !date || !user_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    pool.query(
      'INSERT INTO orders (price, date, user_id) VALUES ($1, $2, $3) RETURNING *',
      [price, date, user_id],
      (err, result) => {
        if (err) {
          return next(err);
        }
        res.status(201).json(result.rows[0]);
      }
    );
  });
  
  // PUT - Edit one order by ID
  orderRouter.put('/orders/:id', (req, res, next) => {
    const orderId = req.params.id;
    const { price, date, user_id } = req.body;
  
    if (!price || !date || !user_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    pool.query(
      'UPDATE orders SET price = $1, date = $2, user_id = $3 WHERE id = $4 RETURNING *',
      [price, date, user_id, orderId],
      (err, result) => {
        if (err) {
          return next(err);
        }
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }
        res.json(result.rows[0]);
      }
    );
  });
  
  // DELETE - Delete one order by ID
  orderRouter.delete('/orders/:id', (req, res, next) => {
    const orderId = req.params.id;
  
    pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [orderId], (err, result) => {
      if (err) {
        return next(err);
      }
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ message: 'Order deleted successfully' });
    });
  });

export default orderRouter;