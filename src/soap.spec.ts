import { createSoapApiClient } from './soap';

describe('soap', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSoapApiClient', () => {
    it('should be a function', () => {
      expect(typeof createSoapApiClient).toEqual('function');
    });
  });
});
