const nodemailer = require('nodemailer');

const sendEmail = async (email, html) => {
  console.log(email, html);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',

    port: 587,
    secure: false,
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: '"SHome" <SHome@gmail.com>',
    to: email,
    subject: 'Verify forgot password',
    html: html,
  });
  return info;
};

module.exports = sendEmail;
