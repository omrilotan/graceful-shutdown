const wait = require('@lets/wait');
const { pub, sub } = require('.');

describe('lib/pubsub', () => {
	let n = 0;
	let NAME;
	beforeEach(() => {
		NAME = `event-name-${++n}`;
	});

	it('Should not break on a missing set', async() => {
		expect(async () => await pub(NAME)).not.to.throw();
	});

	it('Should fire up a sub on pub', async() => {
		const fn = spy();

		sub(NAME, fn);
		expect(fn, 'sub').to.not.have.been.called;
		pub(NAME);
		expect(fn, 'pub').to.have.been.called;
	});

	it('Should wait for async functions', async() => {
		const fn = spy();

		sub(NAME, async() => {
			await wait(10);
			fn();
		});
		expect(fn, 'sub').to.not.have.been.called;
		const p = pub(NAME);
		expect(fn, 'sub').to.not.have.been.called;
		await p;
		expect(fn, 'pub').to.have.been.called;
	});

	it('Should call multiple callbacks', () => {
		const fns = [spy(), spy()];
		sub(NAME, fns[0]);
		sub(NAME, fns[1]);
		pub(NAME);
		expect(fns[0], 'pub').to.have.been.called;
		expect(fns[1], 'pub').to.have.been.called;
	});
});
