const {promisify} = require('util')
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
        passwordConfirm : req.body.passwordConfirm ,
        passwordChangedAt : req.body.passwordChangedAt ,
        role : req.body.role 
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

exports.protect = catchAsync(async (req , res , next) => {
    //Checking Token whether it is there
    let token ;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[2];
        console.log(token);
    }

    if(!token){
        return next(new AppError('You are not logged in. Please log in to get access') , 401)
    }

    // verification Token
    const decoded = await promisify(jwt.verify)(token , process.env.JWT_SECRET)
    
    //Check if the user exists
    const freshUser = await User.findById(decoded.id)
    if(!freshUser) {
        return next(new AppError("The user belonging to this token does not exist" , 401))
    }

    //Check if user changed the password after the token was issued
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently Changed the password' , 401))
    }

    //grant access to the next route
    req.user = freshUser
    next()
})

exports.restrictTo = (...roles) => {
    return (req , res , next) => {
        //Roles is an array ['admin' , 'lead-guide']
        if(!roles.includes(req.user.role)){
            return next(new AppError("user doesnot have permissions" , 403))
        }

        next()
    }
}
