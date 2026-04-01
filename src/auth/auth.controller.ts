import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login/staff')
  @ApiOperation({ summary: 'Login Staff' })
  async loginStaff(@Body() dto: LoginDto) {
    return this.authService.login(dto, 'STAFF');
  }

  @Post('login/superadmin')
  @ApiOperation({ summary: 'Login Superadmin' })
  async loginSuperadmin(@Body() dto: LoginDto) {
    return this.authService.login(dto, 'SUPERADMIN');
  }

  @Post('login')
  @ApiOperation({ summary: 'Login (any role)' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get Profile' })
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.sub);
  }
}
