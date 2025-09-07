import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Req() req: any) {
    const user = { userId: 1, username: 'john' };
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
      return { error: 'Refresh token expired or invalid' };
    }
  }
}
