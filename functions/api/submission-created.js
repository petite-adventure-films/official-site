require('dotenv').config();

const nodemailer = require('nodemailer');

exports.handler = function(event, context, callback) {

	// const { name, address, tel, email } = JSON.parse(event.body).payload.data;

	const body = JSON.parse(event.body)
	const data = body.payload.data
	const name = data.name
	const email = data.email
	const address = data.address
// console.log('JSON.parse(event.body).payload.data')
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
		from    : `petite adventure films <info@petiteadventurefilms.com>`,
		to      : 'drestard@gmail.com',
		subject : 'testありがとうございます',
		text    : `${email}/n${name}/n${address}/n/n${JSON.stringify(body)}/n${JSON.stringify(data)}/nありがとうございます`
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
}