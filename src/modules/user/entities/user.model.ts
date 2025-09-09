import { readFileSync } from 'fs';
import { publicEncrypt, privateDecrypt } from 'crypto';

const PUBLIC_KEY = readFileSync('public.pem', 'utf8');
const PRIVATE_KEY = readFileSync('private.pem', 'utf8');

export class UserEntity {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    private password: string 
  ) {}

  setPassword(password: string) {
    const buffer = Buffer.from(password, 'utf8');
    this.password = publicEncrypt(PUBLIC_KEY, buffer).toString('base64');
  }

  checkPassword(password: string): boolean {
    const decrypted = privateDecrypt(PRIVATE_KEY, Buffer.from(this.password, 'base64')).toString('utf8');
    return password === decrypted;
  }
}
