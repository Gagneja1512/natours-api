const nodemailer = require('nodemailer')

const sendEmail = async options => {

    const username = process.env.EMAIL_USERNAME
    const password = process.env.EMAIL_PASSWORD

    //Create the transporter
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user : username ,
            pass:  password
        }
    })

    //define the mail options 
    const mailOptions = {
        from : 'aadityaarora1215@gmail.com' ,
        to : options.email , 
        subject : options.subject , 
        text : options.message
    }

    //actually send the mail
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail