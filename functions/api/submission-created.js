require('dotenv').config();

const nodemailer = require('nodemailer');

exports.handler = function(event, context, callback) {

	const { email } = JSON.parse(event.body).payload.data;

	// OAuth認証情報
	const auth = {
		type         : 'OAuth2',
		user         : process.env.OAUTH_USER,
		clientId     : process.env.OAUTH_CLIENT_ID,
		clientSecret : process.env.OAUTH_CLIENT_SECRET,
		refreshToken : process.env.OAUTH_REFRESH_TOKEN
	};

	// トランスポート
	const transport = {
		service : 'gmail',
		auth    : auth
	};

	let transporter = nodemailer.createTransport(transport);

	let mailOptions = {
		from    : `test`,
		to      : `${useremail}`,
		subject : 'testありがとうございます',
		text    : `ありがとうございます`,
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			callback(error);
		} else {
			callback(null, {
				statusCode: 200,
				body: 'ok',
			});
		}
	});
};
