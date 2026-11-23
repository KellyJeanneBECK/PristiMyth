import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, type User } from '../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeIdentifier(value: string): string {
    return value.trim().normalize('NFC').toLowerCase();
  }

  private normalizeEmail(email?: string): string | null {
    if (email === undefined) {
      return null;
    }
    return this.normalizeIdentifier(email) || null;
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByIdentifierForLogin(identifier: string): Promise<User | null> {
    const value = this.normalizeIdentifier(identifier);
    const searchIdentifier = value.includes('@')
      ? { email: value }
      : { pseudo: value };
    return this.prisma.user.findUnique({
      where: searchIdentifier,
      omit: {
        passwordHash: false,
      },
    });
  }

  async createUser(data: {
    pseudo: string;
    email?: string;
    passwordHash: string;
  }): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          pseudo: this.normalizeIdentifier(data.pseudo),
          email: this.normalizeEmail(data.email),
          passwordHash: data.passwordHash,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' // P2002 = uniqueness constraint violated
      ) {
        throw new ConflictException('Pseudo ou email déjà utilisé');
      }
      throw error;
    }
  }
}
