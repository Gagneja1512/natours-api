const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const AppError = require('./Utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRouter')
const userRouter = require('./routes/userRouter')

const app = express()

app.use(helmet())

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

const limiter = rateLimit({
    max : 100 ,
    windowMs : 60*60*1000 ,
    message : "To many requests from this IP. Request after some time"
})

app.use('/api' , limiter)

app.use(express.json())

// prevent No SQL query injections
app.use(mongoSanitize()) 

// Prevent Against xss attacks
app.use(xss())

// Parameter pollution
app.use(hpp({
    whitelist : ['duration' , 'ratingsAverage' , 'ratingsQuantity' , 'maxGroupSize' , 'price' , 'difficulty']
}))

app.use(express.static(`${__dirname}/public`))

app.use((req , res , next) => {
    req.requestTime = new Date().toISOString()
    // console.log(req.headers)
    next()
})
    
app.use('/api/v1/tours' , tourRouter) 
app.use('/api/v1/users' , userRouter)  

app.all('*' , (req , res , next) => {
    next(new AppError(`Can't find ${req.originalUrl}` , 404))
})

app.use(globalErrorHandler)
 
module.exports = app