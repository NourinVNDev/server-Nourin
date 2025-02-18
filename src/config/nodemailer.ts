import nodemailer from 'nodemailer';


const GenerateOTP=(email:string,otp:string)=>{



  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER||'nourinvn@gmail.com',
      pass: process.env.EMAIL_PASS||'buap yddq bnue hdcz',
    },
  });
  
  // Send an email
  transporter.sendMail({
    from: process.env.EMAIL_USER||'nourinvn@gmail.com',
    to: email,
    subject: 'Your OTP',
    text: `Your OTP is ${otp}`,
  }, (err, info) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });

}
export default GenerateOTP;


  