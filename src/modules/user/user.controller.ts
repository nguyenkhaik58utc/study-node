import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { LoginDto } from '../auth/dto/Login.dto';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.getUsers();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body(new ValidationPipe()) updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }

  @Post('login')
  async login(@Body(new ValidationPipe()) loginDto: LoginDto) {
    const { email, password } = loginDto;
    return this.userService.validateUser(email??"", password??"");
  }
}
