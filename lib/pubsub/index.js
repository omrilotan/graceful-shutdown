/**
 * Event store
 * @type {Map}
 */
const store = new Map();

/**
 * pub/sub instance
 * @type {Object}
 * @property {Function} sub
 * @property {Function} pub
 */
module.exports = {

	/**
	 * Subscribe function
	 * @param  {Any}      identifier
	 * @param  {Function} callback
	 */
	sub: (identifier, callback) => {
		store.has(identifier) || store.set(identifier, new Set());
		store.get(identifier).add(callback);
	},

	/**
	 * Publish event
	 * @param  {Any}   identifier
	 */
	pub: async identifier => store.has(identifier) && await Promise.all(
		Array.from(
			store.get(identifier),
		).map(
			callback => callback.call(),
		),
	),
};
