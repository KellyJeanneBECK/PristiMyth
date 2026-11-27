import { type PublicUser } from '../types/public-user.type';
import { type User } from '../../generated/prisma/client';

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    pseudo: user.pseudo,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
