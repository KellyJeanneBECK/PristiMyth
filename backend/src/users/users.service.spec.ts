import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { type User } from '../generated/prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  const createMock = jest.fn();
  const findUniqueMock = jest.fn();

  function buildUser(overrides: Partial<User> = {}): User {
    const defaultData: User = {
      id: '01a207e3-2eca-79e3-ae86-47bd432727ae',
      pseudo: 'pseudoriginal',
      email: 'pseudoriginal@example.com',
      passwordHash: 'PassWord',
      role: 'USER',
      createdAt: new Date(),
    };
    return { ...defaultData, ...overrides };
  }

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: { create: createMock, findUnique: findUniqueMock },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should normalize pseudo and email', async () => {
      createMock.mockResolvedValue(buildUser());
      await service.createUser({
        pseudo: '   PseudOriginal',
        email: '  pseudoriginal@EXAMPLE.com',
        passwordHash: 'PassWord',
      });
      expect(createMock).toHaveBeenCalledWith({
        data: {
          pseudo: 'pseudoriginal',
          email: 'pseudoriginal@example.com',
          passwordHash: 'PassWord',
        },
      });
    });

    it.each([undefined, '', '   '])(
      'should store null when email is %p',
      async (value) => {
        createMock.mockResolvedValue(buildUser());
        await service.createUser({
          pseudo: '   PseudOriginal',
          email: value,
          passwordHash: 'PassWord',
        });

        expect(createMock).toHaveBeenCalledWith({
          data: {
            pseudo: 'pseudoriginal',
            email: null,
            passwordHash: 'PassWord',
          },
        });
      },
    );
  });

  describe('findByIdentifierForLogin', () => {
    it.each([
      { input: '   pseudOriginal  ', searchWhere: { pseudo: 'pseudoriginal' } },
      {
        input: 'pseudOriginal@Example.COM',
        searchWhere: { email: 'pseudoriginal@example.com' },
      },
    ])(
      'should search the normalized identifier with "$input"',
      async ({ input, searchWhere }) => {
        const user = buildUser();
        findUniqueMock.mockResolvedValue(user);
        const result = await service.findByIdentifierForLogin(input);

        expect(findUniqueMock).toHaveBeenCalledWith({
          where: searchWhere,
          omit: { passwordHash: false },
        });
        expect(result).toBe(user);
      },
    );

    it('should return null for an unknown identifier', async () => {
      findUniqueMock.mockResolvedValue(null);
      const result = await service.findByIdentifierForLogin('unknown');
      expect(result).toBeNull();
    });
  });
});
