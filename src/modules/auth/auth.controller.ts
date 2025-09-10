import { UserService } from './../user/user.service';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/Login.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private userService : UserService) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập để lấy JWT token' })
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto) {
    const user = await this.userService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(@Body() body: any) {
    const { refresh_token } = body;

    try {
      console.log('refresh token:', refresh_token);
      const payload = this.authService.verifyRefreshToken(refresh_token);
      console.log('Payload from refresh token:', payload);
      const user = await this.userService.getUserIfRefreshTokenMatches(payload.id, refresh_token);      
      console.log('user from refresh token:', user);

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
