const User = require('./../models/userModel')
const catchAsync = require('./../Utils/catchAsync')

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