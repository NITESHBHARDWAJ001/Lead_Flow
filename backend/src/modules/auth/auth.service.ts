import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';
import { AuthenticationError } from '../../utils/errors';
import type { LoginResponse } from './auth.types';

export async function loginService(email: string, password: string): Promise<LoginResponse> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    logger.warn(`Login attempt with unknown email: ${email}`);
    throw new AuthenticationError('Invalid email or password');
  }

  if (!user.isActive) {
    logger.warn(`Login attempt for inactive user: ${email}`);
    throw new AuthenticationError('Your account has been deactivated. Contact admin.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    logger.warn(`Invalid password for user: ${email}`);
    throw new AuthenticationError('Invalid email or password');
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  logger.info(`User logged in: ${email} (${user.role})`);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  };
}
