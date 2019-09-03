const socketManager = require('../socketManager');
const shutdown = require('../shutdown');

/**
 * Register signal termination to shut service down gracefully
 * @param  {net.Server} server  Server instance
 * @param  {Number}     [options.timeout=10000]
 * @param  {Object}     [options.logger=console]
 * @return {Function}
 */
module.exports = function procedure(server, {
	timeout = 10000,
	logger = console,
	onsuccess = () => process.exit(0),
	onfail = () => process.exit(1),
	pub,
} = {}) {
	if (logger === false) {
		logger = new Proxy({}, {get: () => () => null});
	}

	const sockets = socketManager({server});
	const action = () => shutdown({server, timeout, logger, sockets, onsuccess, onfail, pub});
	action.sockets = sockets;

	return action;
};

