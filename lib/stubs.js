/**
 * const { sockets, socket, server, timeout, logger, onsuccess, onfail } = require('../stubs');
 */
Object.defineProperty(
	module,
	'exports',
	{
		get: () => {
			const forceShutdown = stub();
			const getConnections = stub();
			const logger = { info: stub(), error: stub() };
			const onfail = stub();
			const onsuccess = stub();
			const pubsub = { pub: stub(), sub: stub() };
			const server = { close: stub() };
			const shutdown = stub();
			const socket = { setTimeout: stub(), on: stub(), end: stub() };
			const socketManager = stub();
			const sockets = new Set();
			const timeout = 7;
			sockets.add(Object.assign({}, socket));
			sockets.add(Object.assign({}, socket));
			sockets.add(Object.assign({}, socket));

			function reset() {
				forceShutdown.reset();
				getConnections.reset();
				logger.error.reset();
				logger.info.reset();
				onfail.reset();
				onsuccess.reset();
				pubsub.pub.reset();
				pubsub.sub.reset();
				server.close.reset();
				shutdown.reset();
				socket.end.reset();
				socket.on.reset();
				socket.setTimeout.reset();
				socketManager.reset();
				socketManager.returns(sockets);
				delete server.shuttingDown;
			}

			return {
				forceShutdown,
				getConnections,
				logger,
				onfail,
				onsuccess,
				pubsub,
				reset,
				server,
				shutdown,
				socket,
				socketManager,
				sockets,
				timeout,
			};
		},
	},
);
