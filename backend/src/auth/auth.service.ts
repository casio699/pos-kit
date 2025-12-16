import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(tenant_id: string, email: string, password: string, first_name: string, last_name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      tenant_id,
      email,
      password_hash: hashedPassword,
      first_name,
      last_name,
      roles: ['user'],
    });
    return this.userRepo.save(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, roles: user.roles };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { access_token, refresh_token, user };
  }

  async validateUser(userId: string) {
    return this.userRepo.findOne({ where: { id: userId } });
  }
}
