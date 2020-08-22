require('dotenv').config();

const nodemailer = require('nodemailer');

exports.handler = function(event, context, callback) {

	const { name
		, email
		, tel
		, address
		, receipt
		, receiptName
		, receiptDescription
		, orderID
		, order
		, paymentMethod
	} = JSON.parse(event.body).payload.data;

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

	let mailForm = `${name}様

ご注文をいただき誠にありがとうございます。
ご注文いただきました内容は下記の通りです。ご確認ください。

------ 注文内容 ------
${order.fill().map((item, i) => `
${item}
`).join('')}

------ 決済情報 ------
${(paymentMethod == 1) ? '振込' : 'クレジットカード'}
合計: ${total}

------ お届け先 ------
お名前: ${name}
住所: ${address}
電話番号: ${tel}
メールアドレス: ${email}

------- 領収書 -------
${receipt ? `必要
お宛名 : ${receiptName ? receiptName : '-' }
但し書き : ${receiptDescription ? receiptDescription : '-' }
`: '不要'}

---------------------

注文番号: ${orderID}
この度はご注文誠にありがとうございました。
またのご利用をお待ち申し上げております。

//////////////////////
petite adventure films
URL http://petiteadventurefilms.com
//////////////////////
`;

	let transporter = nodemailer.createTransport(transport);
	let mailOptions = {
		from    : `petite adventure films <webmaster@petiteadventurefilms.com>`,
		to      : `${email}`,
		subject : '[petite adventure films]ご注文完了のお知らせ',
		text    : mailForm};

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