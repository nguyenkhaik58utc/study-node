import { TokenService } from '../token/token.service';
import { UserService } from './../user/user.service';
import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/Login.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập để lấy JWT token' })
  @ApiBody({ type: LoginDto })
  async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    const user = await this.userService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(@Body() body: any) {
    const { refresh_token } = body;

    try {
      const payload = this.tokenService.verifyRefreshToken(refresh_token);
      const user = await this.userService.getUserIfRefreshTokenMatches(
        payload.id,
        refresh_token,
      );

      if (!user) {
        return { error: 'Invalid refresh token' };
      }

      const newAccessToken = this.tokenService.generateAccessToken(payload);

      return {
        access_token: newAccessToken,
      };
    } catch (err) {
      return { error: 'Refresh token expired or invalid: ' + err.message };
    }
  }
}
