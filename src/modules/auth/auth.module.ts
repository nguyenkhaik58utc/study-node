import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_KEY ?? "xxx",
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {
  private users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
      refreshToken: '',
    },
  ];

  async saveRefreshToken(userId: number, token: string) {
    const user = this.users.find(u => u.userId === userId);
    if (user) {
      user.refreshToken = token;
    }
  }

  async getUserIfRefreshTokenMatches(userId: number, token: string) {
    const user = this.users.find(u => u.userId === userId);
    if (!user || user.refreshToken !== token) return null;
    return user;
  }
}
