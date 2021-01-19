import { MenuHelper } from './menu-helper';

describe('MenuHelper', () => {
  it('should create an instance', () => {
    expect(new MenuHelper({menus: [], titles: []}, null)).toBeTruthy();
  });
});
