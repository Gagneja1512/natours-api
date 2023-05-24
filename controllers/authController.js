const { promisify } = require('util')
const User = require('./../models/userModel')
const catchAsync = require('./../Utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('./../Utils/appError')
const sendEmail = require('./../Utils/email')
const crypto = require('crypto')

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    })

    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    //If email and password exists
    if (!email || !password) {
        return next(new AppError("Please Provide email and Password", 400))
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401))
    }

    // If everything is ok then send token to the client.
    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })
})

exports.protect = catchAsync(async (req, res, next) => {
    //Checking Token whether it is there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[2];
        // console.log(token);
    }

    if (!token) {
        return next(new AppError('You are not logged in. Please log in to get access'), 401)
    }

    // verification Token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    //Check if the user exists
    const freshUser = await User.findById(decoded.id)
    if (!freshUser) {
        return next(new AppError("The user belonging to this token does not exist", 401))
    }

    //Check if user changed the password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently Changed the password', 401))
    }

    //grant access to the next route
    req.user = freshUser
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //Roles is an array ['admin' , 'lead-guide']
        if (!roles.includes(req.user.role)) {
            return next(new AppError("user doesnot have permissions", 403))
        }

        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new AppError("The user doesnot exist", 403))
    }

    //Generate random token for reseting the password
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })

    //send it to user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to: ${resetURL}.\n If you didnt forgot your password then ignore this. Have a great day.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token',
            message
        })

        res.status(200).json({
            status: "success",
            data: {
                resetToken
            }
        })
    } catch(err) {
        console.log(err);
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({validateBeforeSave : false})

        return next(new AppError("Error in sending Email .Try again later"))
    }
})

exports.resetPassword = async(req , res , next) => {
    //Get user based on the token 
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        passwordResetToken : hashedToken ,
        passwordResetExpires : {$gte : Date.now()}
    });

    // if token not expired and there is user then change the password
    if(!user){
        return next(new AppError('Token is invalid or the expired') , 404);
    }
    
    user.password = req.body.password 
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined 
    user.passwordResetExpires = undefined

    await user.save()
    //log the user in

    const token = signToken(user._id)

    res.status(200).json({
        status : "success" , 
        data : {
            user ,
            token 
        }
    })
}

exports.updatePassword = catchAsync(async(req , res , next) => {
    // Check from the user collection
    const user = await User.findById(req.user.id).select('+password')

    // check if posted current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent , user.password))){
        return next(new AppError("Current password is wrong"))
    }

    //if so update the password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()

    //log the user in ... send the jwt
    const token = signToken(user._id)

    res.status(201).json({
        status : "success" , 
        data : {
            user  , 
            token
        }
    })
})