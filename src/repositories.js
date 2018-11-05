/**
 * Usage as below.
 *
 * Required properties are id (number), name (string), and topics (an array).
 *
 * ```
 * const repositoryStore = require('./repositories').instance;
 * ```
 */
const repositoryStore = new Map();

module.exports = {
	instance: repositoryStore
};
