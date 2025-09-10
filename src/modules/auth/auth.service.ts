import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private userService: UserService) { }

    async saveRefreshToken(userId: number, token: string) {
        await this.userService.updateUser(userId, { refreshToken: token });
    }

    async login(user: any) {
        const accessToken = this.jwtService.sign(user, {
            secret: process.env.JWT_KEY ?? "xxx",
            expiresIn: '15m',
        });

        const refreshToken = this.jwtService.sign(user, {
            secret: process.env.JWT_KEY ?? "xxx",
            expiresIn: '7d',
        });

        await this.saveRefreshToken(user.id, refreshToken);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }


    generateAccessToken(payload: any) {
        return this.jwtService.sign({ ...payload }, {
            secret: process.env.JWT_KEY ,
            expiresIn: '15m',
        });

    }

    verifyRefreshToken(token: string) {
        return this.jwtService.verify(token, {
            secret: process.env.JWT_KEY ,
        });
    }

    async logout(userId: number) {
        await this.userService.updateUser(userId, { refreshToken: "" });
    }
}
