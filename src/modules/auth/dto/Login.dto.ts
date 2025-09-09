import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john', description: 'Mail đăng nhập' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu' })
  @IsNotEmpty()
  password: string;
}