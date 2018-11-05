const repositories = require('../src/repositories').instance;

describe('repositories.js', () => {
	test('instance property returns a Map', () => {
		expect(repositories).toBeInstanceOf(Map);
	});

	test('instance should be global', () => {
		const repository = { id: 1, name: 'foo-bar', topics: [] };

		repositories.set(repository.id, repository);

		const subject = require('../src/repositories').instance;

		expect(subject.get(repository.id)).toBe(repository);

		subject.delete(repository.id);

		expect(repositories.get(repository.id)).toBe(undefined);
	});
});
