import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create(dto, passwordHash);
    return this.issueTokens(user.id, user.email, user.role, user.organization.toString());
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Incorrect email or password.');
    }
    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Incorrect email or password.');
    }
    await this.usersService.touchLastLogin(user.id);
    return this.issueTokens(user.id, user.email, user.role, user.organization.toString());
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Your session has expired. Please sign in again.');
    }

    const user = await this.usersService.findByEmailWithPassword(payload.email);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Your session has expired. Please sign in again.');
    }
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Your session has expired. Please sign in again.');
    }
    return this.issueTokens(user.id, user.email, user.role, user.organization.toString());
  }

  async logout(userId: string) {
    await this.usersService.setRefreshTokenHash(userId, null);
  }

  private async issueTokens(sub: string, email: string, role: string, organization: string) {
    const payload = { sub, email, role, organization };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.usersService.setRefreshTokenHash(sub, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
      user: { id: sub, email, role, organization },
    };
  }
}
