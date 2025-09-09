import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserEntity } from './entities/user.model';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const userEntity = new UserEntity(
      0,
      createUserDto.name,
      createUserDto.email,
      ''
    );
    userEntity.setPassword(createUserDto.password);

    return this.prisma.user.create({
      data: {
        name: userEntity.name,
        email: userEntity.email,
        password: userEntity['password'],
      },
    });
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };

    if (updateUserDto.password) {
      const userEntity = new UserEntity(id, updateUserDto.name ?? '', updateUserDto.email ?? '', '');
      userEntity.setPassword(updateUserDto.password);
      data.password = userEntity['password'];
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
  }

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });
  }

  async deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const userEntity = new UserEntity(user.id, user.name, user.email, user.password);

    const isValid = userEntity.checkPassword(password);
    if (!isValid) throw new UnauthorizedException('Invalid password');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
