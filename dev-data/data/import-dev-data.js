const mongoose = require('mongoose')
const dotenv = require('dotenv')
const fs = require('fs')
const Tour = require('../../models/tourModel')

dotenv.config({path : './config.env'})
 
const DB = process.env.DATABASE.replace('<PASSWORD>' , process.env.DATABASE_PASSWORD)
mongoose.connect(DB , {
    useNewUrlParser : true ,
    useCreateIndex : true ,
    useFindAndModify : false ,
    useUnifiedTopology : true
}).then(() => {
    console.log("Connection Successfull")
}) 

// Reafing the json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json` , 'utf-8'))

// import data into database
const importData = async() => {
    try {
        await Tour.create(tours)
        console.log('Data logged in successfully')
    } catch(err) {
        console.log(err)
    }
    process.exit()
}

const deleteData = async () => {
    try {
        await Tour.deleteMany()
        console.log('Data deleted Successfully')
    } catch(err) {
        console.log(err)
    }
    process.exit()
}

if(process.argv[2] === '--import'){
    importData()
}

if(process.argv[2] === '--delete'){
    deleteData()
}

console.log(process.argv)