const middleware = {}

middleware['getContentful'] = require('../middleware/getContentful.js')
middleware['getContentful'] = middleware['getContentful'].default || middleware['getContentful']

export default middleware
