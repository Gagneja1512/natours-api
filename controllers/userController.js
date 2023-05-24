const AppError = require('../Utils/appError');
const User = require('./../models/userModel')
const catchAsync = require('./../Utils/catchAsync')

const filteredObj = (obj , ...allowedFields) => {
    const newObject = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)){
            newObject[el] = obj[el]
        }
    })

    return newObject
}

exports.getAllUsers = catchAsync(async (req, res , next) => {
    const users = await User.find() ;
    
    res.status(200).json({
        status : 'sucess' , 
        results : users.length , 
        data : {
            users
        }
    })
})

exports.updateMe = catchAsync(async(req , res , next) => {
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError("Update password is not here , go :)"))
    }

    const filteredBody = filteredObj(req.body , 'name' , 'email')
    const updatedUser = await User.findByIdAndUpdate(req.user.id  , filteredBody , {
        new : true ,
        runValidators : true
    })
    res.status(200).json({
        status : "success" ,
        data : {
            updatedUser
        }
    })
})


exports.deleteMe = catchAsync(async (req , res , next) => {
    await User.findByIdAndUpdate(req.user.id , {active : false})

    res.status(204).json({
        status : "success" , 
        data : null
    })
})

exports.getUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route has not been made yet!!!"
    })
}

exports.createUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route has not been made yet!!!"
    })
}

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route has not been made yet!!!"
    })
}

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route has not been made yet!!!"
    })
}