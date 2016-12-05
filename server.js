const Hapi = require('hapi');
const Blipp = require('blipp');
const Joi = require('joi');
const server = new Hapi.Server();

server.connection({
	port: 1337,
	host: '127.0.0.1'
});

server.route([
{
	method: 'GET',
	path: '/hello/{name}',
/*	handler: function (request, reply) {
		return reply('Hello World of Hapi\n');
	} */
	config: {
		description: 'Return an object with hello message',
		validate: {
			params: {
				name: Joi.string().min(3).required()
				}},
		pre: [],
/* Example using pre
		pre: [ setupDBConnection, 	// series
				checkUserExists, 	// series
				[ getUserDetails, getUserConnections ]	// parallel
			],
		handler: function (request, reply) {
			const user = request.pre.userDetails;
			user.connections = request.pre.userConnections;
			return reply(user);
			}
*/
		handler: function (request, reply) {
			const name = request.params.name;
			return reply({ message: `Hello ${name}` });			// return to client, except if reply() inside PreRequisite method, it will return to request.pre object

/* Example for various reply
			return reply(new Error());					// return error with code 500
			return reply(new Error(), 'success!');		// return error with code 500
			return reply(null, 'success!');				// return 'success!' with code 200
			return reply('success!');					// return 'success!' with code 200
*/
			}//,
/* Example for browser-cache control
		cache: { expiresIn: 3600000 }	// in milliseconds
*/
	}
},
{	
	method: '*',
	path: '/{p*}',										// route to catch all other request
	handler: function (request, reply) {
		return reply('The page was not found').code(404);
	}
}
]);

/* Example for catch-all route for special 'not found' page that haven't matched other route
server.route({
	method: '*',
	path: '/{p*}',							// route to catch all other request
	handler: function (request, reply) {
		return reply('The page was not found').code(404);	// default, it will return code 200. Alternative to this is using Boom.notFound() error object
		return reply('The page was not found').type('text/plain');		// Modify content type
		return reply('The page was not found').header('X-Custom','value');		// Modify header
	}
});
*/

server.ext('onRequest', function (request, reply) {
	console.log(`request received: ${request.raw.req.url}`);
	return reply.continue();			// to return back to framework and continue the request life cycle
});

server.register(Blipp, (err) => {
	if(err) {
		throw err;
	}
	
	server.start((err) => {
		if(err) {
			throw err;
		}
		console.log(`Server running at ${server.info.uri}`);
	});
});

/* Routes rules for deterministic in hapi will do from most specific to the most general route
/sample/{segment1}/{segment2}		// required
/path/{segment1?}/something			// Optional segment1 (denoted by ?)
/path/{segment*}					// can provide any number of segment from 0 upward (anything will match this route)
/path/{segment*2}					// can provide until 2 segment
*/

/* Example to extend interfaces in hapi like server and reply, but should easier to use plugin

## Create new custom reply method called hello, which can be called in handler
const hello = function (name) {
	return this.response({hello: name});
}
server.decorate('reply','hello',hello);
server.route({
	method: 'GET',
	path: '/{name}',
	handler: function(request,reply) {
		return reply.hello(request.params.name);
	}
});

## Pass different config object on server.handler()
server.handler('hello', (route, options) => 
	{
		return function(request,reply) {
			const hello = options.customHello || 'Hello';
			const name = request.params.name;
			return reply(`${hello} ${name}`);
		}
	});
server.route({
	method: 'GET',
	path: '/{name}',
	handler: {
		hello: {customHello: 'Welcome'}
		}
});

*/