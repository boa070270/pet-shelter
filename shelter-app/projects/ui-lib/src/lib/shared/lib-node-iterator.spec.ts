import { LibNodeIterator } from './lib-node-iterator';

describe('NodeIterator', () => {
  it('should create an instance', () => {
    expect(new LibNodeIterator(null, null)).toBeTruthy();
  });
});
