const nodemailer = require('nodemailer')

const sendMailer = async (options)=>{
    const transport = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE_NAME, 
        auth:{
            user: process.env.SMTP_USER_EMAIL,
            pass: process.env.SMTP_USER_PASS
        }
    })


    const mailOptions = {
        from: process.env.SMTP_USER_EMAIL,   
        to: options.to,
        subject: options.subject,
        text: options.text
    }

    let info = await transport.sendMail(mailOptions)
    
    return info

}


module.exports = sendMailer
