import type { Request } from 'express';
import type { PublicUser } from './public-user.type';

export interface AuthenticatedRequest extends Request {
  user: PublicUser;
}
