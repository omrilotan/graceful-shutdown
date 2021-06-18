const { BEFORE, AFTER } = require('../eventNames');
const forceShutdown = require('../forceShutdown');
const getConnections = require('../getConnections');

/**
 * Shutdown gracefully (delayed event)
 * @param  {net.Server} options.server
 * @param  {Number}     options.timeout
 * @param  {Function}   options.logger
 * @param  {Set}        options.sockets
 * @param  {Object}     options.pub
 * @return {undefined}
 */
module.exports = async function shutdown({ server, timeout, logger, sockets, onsuccess, onfail, pub }) {
	if (server.shuttingDown) { return; }

	await pub(BEFORE);

	server.shuttingDown = true; // eslint-disable-line require-atomic-updates

	logger.info(`Start shutdown process with ${await getConnections(server)} connections and timeout of ${timeout} ms`);

	logger.info(`Set timeout of ${timeout} for ${sockets.size} sockets`);
	sockets.forEach(socket => {
		socket.on('timeout', () => socket.end());
		socket.setTimeout(
			Math.max(timeout - 10, 0),
		);
	});

	try {
		logger.info('Ask server to close');
		server.close(async function resolution() {
			logger.info('Close server successfully');
			await pub(AFTER);
			onsuccess();
		});

		await forceShutdown({ server, timeout, logger, onsuccess, onfail, pub });

	} catch (error) {
		logger.error(error);
	}
};
