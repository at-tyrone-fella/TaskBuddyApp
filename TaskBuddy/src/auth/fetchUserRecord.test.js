import { fetchUserRecord } from './fetchUserRecord';
import { auth } from '../../firebaseConfig';

jest.mock('../../firebaseConfig', () => ({
  auth: {
    currentUser: 'at56725111998@gmail.com'
  }
}));

describe('fetchUserRecord', () => {
  it('should return the email if a user is signed in', () => {

    const mockEmail = 'at56725111998@gmail.com';
    auth.currentUser = { email: mockEmail };

    const result = fetchUserRecord();
    expect(result).toBe(mockEmail);
  });

  it('should return null if no user is signed in', () => {
    
    auth.currentUser = null;

    const result = fetchUserRecord();
    expect(result).toBeNull();
  });
});
