require('dotenv').config();

const nodemailer = require('nodemailer');




  // OAuth認証情報
  const auth = {
    type         : 'OAuth2',
    user         : 'petiteadventurefilms@petiteadventurefilms.com',
    clientId     : '939037085762-k4mv1fan8nhaqfdrkqld39aau02oln2e.apps.googleusercontent.com',
    clientSecret : 'PSdML4atizTcRaqBbt0Hns1m',
    refreshToken : '1//045UPRQKtzStTCgYIARAAGAQSNwF-L9Ir8KU5xVBKo2CWV4uT_r6qjV0qkiFOZ8CLFQktnRbltsB1qmBLydE_0TT-WOV31uFrRQ8'
  };

  // トランスポート
  const transport = {
    service : 'gmail',
    auth    : auth
  };

  let transporter = nodemailer.createTransport(transport);

  const url = 'https://notes-sharesl.netlify.app/';

  let mailOptions = {
    from    : 'restard653@gmail.com',
    to      : 'drestard@gmail.com',
    subject : 'ありがとう',
    text    : 'ありがとう'
  };

  transporter.sendMail(mailOptions, function(error, info) {
    console.log('info', error, info)
  });
