import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/Login.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập để lấy JWT token' })
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto) {
    
    const user = { userId: 1, username: body.username };
    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(@Body() body: any) {
    const { refresh_token } = body;

    try {
      const payload = this.authService.verifyRefreshToken(refresh_token);
      const user = await this.authService.getUserIfRefreshTokenMatches(payload.sub, refresh_token);

      if (!user) {
        return { error: 'Invalid refresh token' };
      }

      const newAccessToken = this.authService.generateAccessToken(payload);

      return {
        access_token: newAccessToken,
      };
    } catch (err) {
      return { error: 'Refresh token expired or invalid: ' + err.message };
    }
  }
}
