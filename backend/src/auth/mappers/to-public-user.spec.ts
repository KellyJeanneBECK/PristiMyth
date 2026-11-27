import { toPublicUser } from './to-public-user';
import { type User } from '../../generated/prisma/client';

describe('toPublicUser', () => {
  const createdAt = new Date();
  const user: User = {
    id: 'uuid',
    pseudo: 'pseudoriginal',
    email: 'pseudoriginal@example.com',
    passwordHash: 'hashed-password',
    role: 'USER',
    createdAt,
  };

  it('should keep only the public fields', () => {
    expect(toPublicUser(user)).toStrictEqual({
      id: 'uuid',
      pseudo: 'pseudoriginal',
      email: 'pseudoriginal@example.com',
      role: 'USER',
      createdAt,
    });
  });

  it('should not expose passwordHash', () => {
    expect(toPublicUser(user)).not.toHaveProperty('passwordHash');
  });

  it('should keep a missing email as null', () => {
    expect(toPublicUser({ ...user, email: null }).email).toBeNull();
  });
});
