const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { environment } = require('./config');
const isProduction = environment === 'production';

const app = express();
app.use(morgan('dev'));

app.use(cookieParser());
app.use(express.json());

// backend/app.js
const routes = require('./routes');

// backend/app.js
// Security Middleware
if (!isProduction) {
    // enable cors only in development
    app.use(cors());
  }
<<<<<<< HEAD

  // helmet helps set a variety of headers to better secure your app
  app.use(
    helmet.crossOriginResourcePolicy({
      policy: "cross-origin"
    })
  );

  // Set the _csrf token and create req.csrfToken method
  app.use(
    csurf({
      cookie: {
        secure: isProduction,
        sameSite: isProduction && "Lax",
        httpOnly: true
      }
    })
  );



  // After all middlewares
  app.use(routes); // Connect all the routes
=======

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
     policy: "cross-origin"
  })
);
>>>>>>> dev

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true
    }
  })
);



// After all middlewares
app.use(routes); // Connect all the routes

// backend/app.js
// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found.");
    err.title = "Resource Not Found";
    err.errors = { message: "The requested resource couldn't be found." };
    err.status = 404;
    next(err);
  });

  // backend/app.js
const { ValidationError } = require('sequelize');



// Process sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = 'Validation error';
    err.errors = errors;
  }
  next(err);
});

// backend/app.js
<<<<<<< HEAD
// NEEDS TO BE CHANGED TO MATCH THE PRODUCTION OUTPUT
=======
// NEEDS TO BE CHANGED TO MATCH THE PRODUCTION OUTPUT ON API DOCS
>>>>>>> dev
// Error formatter
app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);
    res.json({
      title: err.title || 'Server Error',
      message: err.message,
      errors: err.errors,
      stack: isProduction ? null : err.stack
    });
  });

<<<<<<< HEAD
  // At the bottom of the app.js file export app
=======
>>>>>>> dev
  module.exports = app;
