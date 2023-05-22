const express = require('express')
const morgan = require('morgan')

const AppError = require('./Utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRouter')
const userRouter = require('./routes/userRouter')

const app = express()

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

app.use(express.json())
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