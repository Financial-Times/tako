/**
 * Usage as below.
 *
 * Required properties are id (number), name (string), and topics (an array).
 *
 * ```
 * const repositoryStore = require('./repositories').instance;
 *
 * const repo = { id: 1, name: 'foo-bar' };
 *
 * repositoryStore.set(repo.id, repo);
 * ```
 */
const repositoryStore = new Map();

module.exports = {
	instance: repositoryStore
};
