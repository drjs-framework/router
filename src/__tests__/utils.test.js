import { simplifyArrayLanguages } from '../utils';

describe('utils', () => {
  describe('simplifyArrayLanguages', () => {
    it('Should return a simple array of string with slugs', () => {
      const languages = [
        {
          slug: 'en',
          label: 'English',
        },
        {
          slug: 'es',
          label: 'Español',
        },
      ];

      expect(simplifyArrayLanguages(languages)).toEqual(['en', 'es']);
    });
  });
});
