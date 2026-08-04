import { Users } from '@app/interfaces/users';
import * as _ from 'lodash';

export const usersMock = new Users();
_.assign(usersMock, {
  userId: 0,
  username: 'user1',
  displayName: 'mockDisplayname',
  lastLogin: new Date(),
  pin: '111111',
  procedureDetails: [],
  email: null,
  isAdmin: false,
});
