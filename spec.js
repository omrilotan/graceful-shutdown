const { clean, override } = abuser(__filename);

const { server, sockets, timeout, logger, onsuccess, onfail, pubsub } = require('./lib/stubs');

const action = fake();
action.sockets = sockets;
const procedure = fake.returns(action);
let gracefulShutdown;

describe('graceful-shutdown', () => {
	const { on } = process;
	const { resume } = process.stdin;

	before(() => {
		override('./lib/procedure', procedure);
		override('./lib/pubsub', pubsub);
		process.stdin.resume = stub();
		process.on = stub();
		gracefulShutdown = require('.');
	});
	afterEach(() => {
		process.stdin.resume.reset();
		process.on.reset();
		procedure.resetHistory();
	});
	after(() => {
		clean('.');
		process.on = on;
		process.stdin.resume = resume;
	});

	it('Should interrupt natural process exiting by signal', () => {
		gracefulShutdown();
		expect(process.stdin.resume).to.have.been.called;
	});
	it('Should register to SIGTERM and SIGINT by default', () => {
		gracefulShutdown();

		const events = [
			process.on.firstCall,
			process.on.secondCall,
		].map(call => call.args[0]);

		expect(events).to.include('SIGTERM').and.to.include('SIGINT');
	});
	it('Should register to custom events', () => {
		gracefulShutdown(server, {events: ['one', 'two']});

		const events = [
			process.on.firstCall,
			process.on.secondCall,
		].map(call => call.args[0]);

		expect(events).to.include('one').and.to.include('two');
	});
	it('Should pass to "procedure": server, options: timeout, logger, pubsub.pub', () => {
		const { pub } = pubsub;

		gracefulShutdown(server, {timeout, logger, onsuccess, onfail, pub});
		expect(procedure).to.be.calledWith(server, {timeout, logger, onsuccess, onfail, pub});
	});
	it('Should default logger to console', () => {
		gracefulShutdown();
		const { logger } = procedure.firstCall.args[1];
		expect(logger).to.equal(console);
	});
	it('Should default timeout to 10 seconds', () => {
		gracefulShutdown();
		const { timeout } = procedure.firstCall.args[1];
		expect(timeout).to.equal(1e4);
	});
	it('Should assign shutdown callback received from "procedure" to process events', () => {
		gracefulShutdown();
		const [, arg] = process.on.firstCall.args;
		expect(arg).to.equal(action);
	});
	it('Should expose sub function from pubsub', () => {
		const instance = gracefulShutdown();
		expect(instance.sub).to.equal(pubsub.sub);
	});
});
