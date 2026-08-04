import { Utils } from './utils';
import * as _ from 'lodash';
describe('Utils', () => {

  let utils: Utils;

  beforeEach(() => {
   utils = new Utils();
  });

  it('create an instance', () => {
    expect(utils).toBeTruthy();
  });
});
