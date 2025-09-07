import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    private users = [
        {
            userId: 1,
            username: 'test',
            password: 'xxx',
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


    async login(user: any) {
        const payload = { username: user.username, sub: user.userId };

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_KEY ?? "xxx",
            expiresIn: '15m',
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_KEY ?? "xxx",
            expiresIn: '7d',
        });

        await this.saveRefreshToken(user.userId, refreshToken);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }


    generateAccessToken(payload: any) {
        return this.jwtService.sign(payload, {
            secret: 'access-secret',
            expiresIn: '15m',
        });

    }

    verifyRefreshToken(token: string) {
        return this.jwtService.verify(token, {
            secret: 'refresh-secret',
        });
    }

    async logout(userId: number) {
        const user = this.users.find(u => u.userId === userId);
        if (user) {
            user.refreshToken = '';
        }
    }
}
