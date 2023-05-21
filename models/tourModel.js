const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : [true , 'A tour must have a name'] ,
        unique : true ,
        trim : true ,
        maxLength : [40 , "A tour name must have less than or equals to 40 characters"] ,
        minLength : [5 , "A tour name must have more or equals to 5 characters"]
    } ,
    slug : String ,
    ratingsAverage : {
        type : Number ,
        default : 4.5 ,
        min : [1 , "A tour must have a rating of 1 or above"] ,
        max : [5 , "A tour must have a rating of 5 or less"]
    } ,
    ratingsQuantity : {
        type : Number ,
        default : 0 
    } ,
    price : {
        type : Number ,
        required : [true , "A tour must have a price"]
    } ,
    duration : {
        type : Number ,
        required : [true , 'A tour must have duration.']
    } ,
    maxGroupSize : {
        type : Number ,
        required : [true , 'A tour must have a group size']
    } ,
    difficulty : {
        type : String ,
        required : [true , 'A tour must have a difficulty'] ,
        enum : {
            values : ['easy' , 'medium' , 'difficult'] ,
            message : "Difficulty can be only : easy , medium or difficult" 
        }
    } ,
    priceDiscount : {
        type : Number
    } ,
    summary : {
        type : String ,
        trim : true ,
        required : [true , 'A tour must have a summary']
    } ,
    description : {
        type : String ,
        trim : true ,
    } ,
    imageCover : {
        type : String ,
        required : [true , 'A tour must have a cover image']
    } ,
    images : [String] ,
    createdAt : {
        type : Date ,
        default : Date.now() ,
        select : false
    } ,
    startDates : [Date] ,
    secretTour : {
        type : Boolean ,
        default : false
    }
}, {
    toJSON : {virtuals : true} ,
    toObject : {virtuals : true}
})

tourSchema.virtual('durationWeek').get(function(){
    return this.duration / 7 ;
})


// DOcument middleware : runs before .save() or .create()
tourSchema.pre('save' , function(next){
    this.slug = slugify(this.name  , {lower : true})
    next()
})

// can attach multiple middleware on pre or post
// tourSchema.post('save' , function(doc , next) {
//     console.log(doc)
//     next()
// })



// QUERY MIDDLEWARE
tourSchema.pre(/^find/ , function(next) {
    this.find({secretTour : {$ne : true}})
    next()
})


// AGRREGATION MIDDLEWARE
tourSchema.pre('aggregate' , function(next) {
    this.pipeline().unshift({ $match : {secretTour : {$ne : true}}})
    next()
})

const Tour = mongoose.model('Tour' , tourSchema)

module.exports = Tour