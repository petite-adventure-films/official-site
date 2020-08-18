exports.handler = async function(event) {

	const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

	let result = false
	try {
		const data = JSON.parse(event.body)
		console.log('comehe')
		const res = await stripe.paymentIntents.create({
			  amount: parseInt(data.amount)
			, currency: 'jpy'
			// , source: data.token
			, payment_method_types: ['ideal']
			// , receipt_email: data.email
			// , shipping: data.shipping
			, metadata: data.items

		})
		if (res && res.status === 'succeeded') {
			result = true
		}
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log(error.message)
	}

	const headers = {
		'Access-Control-Allow-Origin': 'http://localhost:3000',
		'Access-Control-Allow-Headers': 'Content-Type'
	}
	return {
		statusCode: 200,
		headers,
		body: result ? 'NORMAL' : 'ERROR'
	}
}