const { BEFORE, AFTER } = require('./lib/eventNames');
const { pub, sub } = require('./lib/pubsub');
const procedure = require('./lib/procedure');

/**
 * Register signal termination to shut service down gracefully
 * @param  {net.Server} server  net.Server
 * @param  {Number}     [options.timeout=10000]
 * @param  {Object}     [options.logger=console]
 * @param  {Array}      [options.events=['SIGTERM', 'SIGINT']]
 * @return {undefined}
 */
function graceful(
		server,
		{
			timeout = 10000,
			logger = console,
			events = [ 'SIGTERM', 'SIGINT' ],
			onsuccess = () => process.exit(0),
			onfail = () => process.exit(1),
		} = {},
) {
	const action = procedure(server, { timeout, logger, onsuccess, onfail, pub });

	process.stdin.resume();
	events.forEach(event => process.on(event, action));

	return { sub, BEFORE, AFTER, sockets: action.sockets };
}

module.exports = graceful;
