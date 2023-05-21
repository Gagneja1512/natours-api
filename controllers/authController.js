const User = require('./../models/userModel')
const catchAsync = require('./../Utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('./../Utils/appError')

const signToken  = id => {
    return jwt.sign({id : id} , process.env.JWT_SECRET , {
        expiresIn : process.env.JWT_EXPIRES
    })
}

exports.signup = catchAsync(async (req , res , next) => {
    const newUser =  await User.create({
        name : req.body.name ,
        email : req.body.email , 
        password : req.body.password , 
        passwordConfirm : req.body.passwordConfirm
    })

    const token = signToken(newUser._id)

    res.status(201).json({
        status : 'success' , 
        token ,
        data : {
            user : newUser
        }
    })
})

exports.login = catchAsync(async(req , res , next) => {
    const {email , password} = req.body

    //If email and password exists
    if(!email || !password){
        return next(new AppError("Please Provide email and Password" , 400))
    }

    // Check if user exists and password is correct
    const user = await User.findOne({email}).select('+password')

    if(!user || !(await user.correctPassword(password , user.password))) {
        return next(new AppError("Incorrect email or password" , 401))
    }

    // If everything is ok then send token to the client.
    const token = signToken(user._id)
    res.status(200).json({
        status : 'success' ,
        token
    })
})
