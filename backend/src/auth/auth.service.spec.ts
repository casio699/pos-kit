import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {},
  hash: jest.fn(async () => 'hashed-password'),
  compare: jest.fn(async () => true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test123!@#',
        first_name: 'Test',
        last_name: 'User',
        tenant_id: 'tenant-1',
      };

      mockUserRepository.create.mockReturnValue(userData);
      mockUserRepository.save.mockResolvedValue({ ...userData, id: 'user-1' });

      const result = await service.register(
        userData.tenant_id,
        userData.email,
        userData.password,
        userData.first_name,
        userData.last_name,
      );

      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: userData.email,
        tenant_id: userData.tenant_id,
      }));
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens on successful login', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        password_hash: '$2b$10$...',
        tenant_id: 'tenant-1',
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.login('test@example.com', 'Test123!@#');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });
  });
});
