const wait = require('@lets/wait');
const { AFTER } = require('../eventNames');

const { clean, override } = abuser(__filename);

let forceShutdown;

const {
	getConnections,
	logger,
	onfail,
	onsuccess,
	pubsub: { pub },
	reset,
	server,
} = require('../stubs');


describe('lib/forceShutdown', () => {
	before(() => {
		override('../getConnections', getConnections);
		forceShutdown = require('.');
	});
	afterEach(reset);
	after(() => clean('.'));

	it('Should call on getConnections', async() => {
		await forceShutdown({server, logger, onsuccess, onfail, pub});
		expect(getConnections).to.have.been.calledWith(server);
	});
	it('Should log error and exit with code 1 if there are open connections', async() => {
		getConnections.returns(2);
		await forceShutdown({server, logger, onsuccess, onfail, pub});
		expect(logger.info).to.not.have.been.called;
		expect(logger.error).to.have.been.called;
		expect(onfail).to.have.been.called;
	});
	it('Should log info and exit with code 0 if there are open connections', async() => {
		getConnections.returns(0);
		await forceShutdown({server, logger, onsuccess, onfail, pub});
		expect(logger.error).to.not.have.been.called;
		expect(logger.info).to.have.been.called;
		expect(onsuccess).to.have.been.called;
	});
	it('Should wait for async logger before exiting', async() => {
		const later = spy();
		await forceShutdown({server, onsuccess, onfail, pub, logger: {
			info: async() => {
				await wait(400);
				expect(onsuccess).to.not.have.been.called;
				expect(onfail).to.not.have.been.called;
				later();
			},
		}});
		expect(later).to.have.been.called;
		expect(onsuccess).to.have.been.called;
	});
	it('Should trigger pub with AFTER event on fail or success', async() => {
		getConnections.returns(0);
		await forceShutdown({server, logger, onsuccess, onfail, pub});
		expect(pub).to.have.been.calledWith(AFTER);

		pub.reset();

		getConnections.returns(2);
		await forceShutdown({server, logger, onsuccess, onfail, pub});
		expect(pub).to.have.been.calledWith(AFTER);
	});
	it('Should trigger pub with AFTER event when success callback has an error', async() => {
		getConnections.returns(0);
		const throws = () => { throw new Error('Something must have gone terribly wrong.'); };
		const onfail = throws;
		const onsuccess = onfail;
		await forceShutdown({server, logger, onsuccess, onfail, pub}).catch(() => void(0));
		expect(pub).to.have.been.calledWith(AFTER);
	});
	it('Should trigger pub with AFTER event when fail callback has an error', async() => {
		getConnections.returns(2);
		const throws = () => { throw new Error('Something must have gone terribly wrong.'); };
		const onfail = throws;
		const onsuccess = onfail;
		await forceShutdown({server, logger, onsuccess, onfail, pub}).catch(() => void(0));
		expect(pub).to.have.been.calledWith(AFTER);
	});
});
