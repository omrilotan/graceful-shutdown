const chai = require('chai');
const sinon = require('sinon');
const abuser = require('abuser');
const sinonChai = require('sinon-chai');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');

chai.use(deepEqualInAnyOrder);
chai.use(sinonChai);

Object.assign(
	global,
	chai,
	sinon,
	{
		sinon,
		abuser,
	}
);

// require('dont-look-up')('./packages');

process.on('unhandledRejection', error => { throw error; });
