const AppError = require('./../Utils/appError')

const handleCastError = err => {
    const message = `Invalid ${err.path} : ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateFields = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]

    const message = `Duplicate field value ${value}. Please choose another name`
    return new AppError(message, 400)
}

const handleValidationError = err => {
    const errors = Object.values(err.errors).map(el => el.message)

    const message = `Invalid Input Data : ${errors.join('. ')}`
    return new AppError(message, 400)
}

const handleJWTError = err => new AppError("Invalid Token Please login Again", 401)

const handlerJWTExpiredError = err => new AppError("Token Expired. Please login Again", 401)

const developmentError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const productionError = (err, res) => {
    if (err.isOperational) {

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        res.status(500).json({
            status: 'error',
            message: err
        })
    }

}

module.exports = (err, req, res, next) => {
    err.status = err.status || 'error'
    err.statusCode = err.statusCode || 500

    if (process.env.NODE_ENV === 'development') {
        developmentError(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = Object.assign(err)

        if (error.name === "CastError") {
            error = handleCastError(error)
        }

        if (error.code === 11000) {
            error = handleDuplicateFields(error)
        }

        if (error.name === "ValidationError") {
            error = handleValidationError(error)
        }

        if (error.name === "JsonWebTokenError") {
            error = handleJWTError(error)
        }

        if (error.name === "TokenExpiredError") {
            error = handlerJWTExpiredError(error)
        }

        productionError(error, res);
    }
}