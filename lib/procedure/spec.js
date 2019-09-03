const { clean, override } = abuser(__filename);

let procedure;

const {
	logger,
	onfail,
	onsuccess,
	pubsub: { pub },
	reset,
	server,
	shutdown,
	socketManager,
	sockets,
	timeout,
} = require('../stubs');

describe('lib/procedure', () => {
	const { exit } = process;
	before(() => {
		process.exit = stub();
	});
	beforeEach(() => {
		clean('.');
		override('../socketManager', socketManager);
		override('../shutdown', shutdown);
		procedure = require('.');
	});
	afterEach(() => {
		reset();
		process.exit.reset();
	});

	after(() => {
		clean('.');
		process.exit = exit;
	});

	it('Should pass server and logger to socket manager', async() => {
		await procedure(server, {timeout, logger, onsuccess, onfail});
		expect(socketManager).to.have.been.calledWith({server});
	});
	it('Should return a shutdown callback bound to arguments and sockets', async() => {
		const fn = await procedure(server, {timeout, logger, onsuccess, onfail, pub});
		fn();
		expect(shutdown).to.have.been.calledWith({server, timeout, logger, sockets, onsuccess, onfail, pub});
	});
	it('Should expose sockets as attribute on the function', async() => {
		const fn = await procedure(server, {timeout, logger, onsuccess, onfail, pub});
		expect(fn.sockets).to.equal(sockets);
	});
	it('Should default timeout to 10 seconds', async() => {
		const fn = await procedure(server);
		fn();
		const [{logger}] = shutdown.firstCall.args;
		expect(logger).to.equal(console);
	});
	it('Should default logger to console', async() => {
		const fn = await procedure(server);
		fn();
		const [{timeout}] = shutdown.firstCall.args;
		expect(timeout).to.equal(1e4);
	});
	it('Should default onsuccess to process.exit', async() => {
		const fn = await procedure(server);
		fn();
		const [{onsuccess}] = shutdown.firstCall.args;
		onsuccess();
		expect(process.exit).to.have.been.calledWith(0);
	});
	it('Should default onfail to process.exit', async() => {
		const fn = await procedure(server);
		fn();
		const [{onfail}] = shutdown.firstCall.args;
		onfail();
		expect(process.exit).to.have.been.calledWith(1);
	});
	it('Should create a proxy when logger is set to false', async() => {
		const fn = await procedure(server, {timeout, logger: false, onsuccess, onfail});
		fn();
		const [{logger}] = shutdown.firstCall.args;
		expect(logger.anything).to.be.a('function');
		expect(logger.info()).to.equal(null);
	});
});
