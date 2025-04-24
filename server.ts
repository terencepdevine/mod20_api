const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

import app from './app';

if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
  throw new Error(
    'DATABASE or DATABASE_PASSWORD is not set in environment variables.'
  );
}

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');

  if (err instanceof Error) {
    console.log(err.name, err.message);
  } else {
    console.log('Unknown error', err);
  }

  server.close(() => {
    process.exit(1);
  });
});
