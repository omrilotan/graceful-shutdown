const wait = require('@lets/wait');

const { clean, override } = abuser(__filename);

let shutdown;

const {
	forceShutdown,
	getConnections,
	logger,
	onfail,
	onsuccess,
	pubsub: { pub },
	reset,
	server,
	socket,
	sockets,
	timeout,
} = require('../stubs');

describe('lib/shutdown', () => {
	beforeEach(() => {
		clean('.');
		override('../getConnections', getConnections);
		override('../forceShutdown', forceShutdown);
		shutdown = require('.');
	});
	afterEach(reset);

	after(() => clean('.'));

	it('Should call server.close', async() => {
		await shutdown({ server, timeout, logger, sockets, onsuccess, onfail, pub });
		expect(server.close).to.have.been.called;
	});
	it('Should log an error when server close can not be called', async() => {
		const error = new Error('Something must have gone wrong');
		server.close.throws(error);
		await shutdown({ server, timeout, logger, sockets, pub });
		expect(logger.error).to.have.been.called;
	});
	it('Should call server.close only once', async() => {
		await shutdown({ server, timeout, logger, sockets, onsuccess, onfail, pub });
		expect(server.close).to.have.been.called;
		server.close.reset();
		await shutdown({ server, timeout, logger, sockets, pub });
		expect(server.close).to.not.have.been.called;
	});
	it('Should call server.close unless server.shuttingDown is true', async() => {
		server.shuttingDown = true;
		await shutdown({ server, timeout, logger, sockets, pub });
		expect(server.close).to.not.have.been.called;
	});
	it('Should exit the onsucess finally after server is closed correctly', async() => {
		await shutdown({ server, timeout, logger, sockets, onsuccess, onfail, pub });
		server.close.firstCall.args[0](); // Call the callback
		await wait();
		expect(onsuccess).to.have.been.called;
	});
	it('Should set timeout for all sockets', async() => {
		await shutdown({ server, timeout, logger, sockets, onsuccess, onfail, pub });
		expect(socket.setTimeout).to.have.been.calledThrice;
		expect(socket.on).to.have.been.calledThrice;
	});
	it('Should register call for socket end on socket timeout', async() => {
		await shutdown({ server, timeout, logger, sockets, onsuccess, onfail, pub });
		expect(socket.on).to.have.been.calledWith('timeout');
		expect(socket.end).to.not.have.been.called;
		socket.on.firstCall.args[1]();
		expect(socket.end).to.have.been.called;
	});
	it('Calls forceShutdown finally', async() => {
		await shutdown({ server, timeout, logger, sockets, onsuccess, onfail, pub });
		expect(forceShutdown).to.have.been.calledWith({ server, timeout, logger, onsuccess, onfail, pub });
	});
});
