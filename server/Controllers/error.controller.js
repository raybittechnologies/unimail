const { errorResponse } = require("./responseHandler");

const sendResponse = (res, message, resCode = 400, err) => {
  if (process.env.NODE_ENV === "production") {
    res.status(resCode).json({
      message,
    });
  }
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(resCode).json({
      message,
      err,
    });
  }
};

exports.sendErrorRes = async (err, req, res, next) => {
  const errCode = err?.code || 400;

  if (errCode === 20404) {
    errorResponse(
      res,
      "Expired OTP or incorrect number provided",
      { err },
      401
    );
  } else if (err.message === "jwt expired")
    sendResponse(res, "Session Expired", err.statusCode, err.stack);
  else if (errCode === "ER_DUP_ENTRY")
    sendResponse(res, err.sqlMessage, 500, err.stack);
  else if (errCode === "ER_BAD_FIELD_ERROR")
    sendResponse(res, err.sqlMessage, 500, err.stack);
  else sendResponse(res, err.message, err.statusCode, err.stack);
};

// const AppError = require("../Utils/apperror");

// //Development error
// const sendErrorDev = (err, req, res) => {
//   //API call
//   if (req.originalUrl.startsWith("/api")) {
//     // console.log('ERROR 🚨💥', err);
//     return res.status(err.statusCode).json({
//       error: err,
//       status: err.status,
//       message: err.message,
//       stack: err.stack,
//     });
//   }
//   //Rendered website call
//   // console.log('ERROR 🚨💥', err);
//   return res.status(err.statusCode).render("error", {
//     title: "Something went wrong",
//     msg: err.message,
//   });
// };

// //Production error
// const sendErrorProd = (err, req, res) => {
//   //For api call
//   if (req.originalUrl.startsWith("/api")) {
//     if (err.isOperational) {
//       return res.status(err.statusCode).json({
//         status: "FAIL!",
//         message: err.message,
//       });
//     }
//     //Some other programming error, don't leak error details
//     // console.log('ERROR 🚨💥', err);
//     return res.status(500).json({
//       status: "Fail!",
//       message: "Something went wrong",
//     });
//   }
//   //Rendered website call
//   // console.log('ERROR 🚨💥', err);
//   if (err.isOperational) {
//     return res.status(err.statusCode).render("error", {
//       title: "Something bad",
//       msg: err.message,
//     });
//   }
//   //Some other programming error, don't leak error details
//   // console.log('ERROR 🚨💥', err);
//   return res.status(err.statusCode).render("error", {
//     title: "Something went wrong",
//     msg: "Please try again",
//   });
// };

// //Catch DATABASE ERRORS
// const catchDbError = (err) => {
//   const message = `Invalid ${err.path}, ${err.value}`;
//   return new AppError(400, message);
// };

// //Duplicate errors
// const catchDuplicateKey = (err) => {
//   const message = `${err.code}: Duplicate key: ${
//     err.message.match(/(["'])(\\?.)*?\1/)[0]
//   }`;
//   return new AppError(400, message);
// };

// //Validation errors
// const validationErrors = (err) => {
//   const message = Object.values(err.errors)
//     .map((el) => el.message)
//     .join(". ");
//   // console.log(message);
//   return new AppError(500, message);
// };

// //Invalid token
// const handleInvalidToken = () =>
//   new AppError(401, "Invalid token, Login again");

// //Expired token
// const handleTokenExpired = () =>
//   new AppError(401, "Session expired, Login again");

// //EXPORTING ERROR MODULE
// module.exports = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "FAIL!";

//   //DEVELOPMENT ERRORS
//   if (process.env.NODE_ENV === "development") {
//     sendErrorDev(err, req, res);
//   }

//   //PRODUCTION ERRORS

//   if (process.env.NODE_ENV === "production") {
//     let error = { ...err };
//     error.message = err.message;
//     if (error.name === "CastError") {
//       error = catchDbError(error);
//     }
//     if (error.code === 11000) {
//       error = catchDuplicateKey(err);
//     }
//     //Validation errors
//     if (err.name === "ValidationError") {
//       error = validationErrors(err);
//     }
//     if (err.name === "JsonWebTokenError") {
//       error = handleInvalidToken();
//     }
//     if (err.name === "TokenExpiredError") {
//       error = handleTokenExpired();
//     }
//     sendErrorProd(error, req, res);
//   }

//   next();
// };
