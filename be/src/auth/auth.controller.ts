import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { AuthEntity } from './entity/auth.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() body: LoginDto): Promise<AuthEntity> {
    return this.authService.login(body.login, body.password);
  }

  @Post('/register')
  register(@Body() body: RegisterDto): Promise<AuthEntity> {
    return this.authService.register(body);
  }
}
