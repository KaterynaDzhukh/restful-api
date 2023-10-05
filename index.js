import express from 'express';
import 'dotenv/config';
import usersRouter from './routers/users.js';
import orderRouter from './routers/orderRouter.js';

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);
app.use('/api/order', orderRouter);



  const PORT = process.env.PORT || 8080;

  app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
  });