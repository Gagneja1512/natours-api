const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : [true , 'Please tell us your name']
    } ,
    email : {
        type : String ,
        required : [true , 'Please provide your email'] , 
        unique : true ,
        lowercase : true ,
        validate : [validator.isEmail , 'Please provide a valid email']
    } , 
    photo : {
        type :String
    } ,
    password : {
        type : String ,
        required : [true , 'Please provide password'] ,
        minLength : 8 , 
        select : false
    } ,
    passwordConfirm : {
        type : String ,
        required : [true , 'Please confirm your password'] ,
        validate : {
            //This validator works only on the CREATE and SAVE method not update etc...
            validator : function(element){
                return element === this.password
            } , 
            message : "Passwords are not same "
        }
    }
})

userSchema.pre('save' , async function(next){
    //Only run when the password is actually modified
    if(!this.isModified('password')) 
        return next() ;

    this.password = await bcrypt.hash(this.password , 12)  ;
    this.passwordConfirm = undefined ;
    next()  ;
})

userSchema.methods.correctPassword = async function(candidatePassword , userPassword) {
    return await bcrypt.compare(candidatePassword , userPassword)
}

const User = mongoose.model('User' , userSchema)

module.exports = User