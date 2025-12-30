import constants from './constants';

describe('All identifiers', () => {
	test('must start with `gde-`', () => {
		const exemtions: (keyof typeof constants.IDENTIFIERS | ({} & string))[] = ['NOTIFICATION'];

		Object.entries(constants.IDENTIFIERS).forEach(([key, value]) => {
			if (!exemtions.includes(key)) {
				expect(value).toMatch(/^gde-/);
			}
		});
	});
});
