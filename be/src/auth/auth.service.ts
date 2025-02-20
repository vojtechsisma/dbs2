import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthEntity } from './entity/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email: email },
    });

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      token: this.jwtService.sign({ userId: user.id }),
    };
  }
}
