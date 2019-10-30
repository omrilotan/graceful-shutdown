/**
 * Server getConnections in promise form
 * @param  {net.Server} server Server instance
 * @return {Number<Promise>}
 */
module.exports = server => new Promise(
	(resolve, reject) => server.getConnections(
		(error, connections) => error
			? reject(error)
			: resolve(connections),
	),
);
