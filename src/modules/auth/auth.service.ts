import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Admin_user } from 'src/entities/admin_user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin_user)
    private adminUserRepository: Repository<Admin_user>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    try {
      const user = await this.adminUserRepository.findOne({ where: { email } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
      }

      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);

      return {
        statusCode: HttpStatus.OK,
        message: 'User logged in',
        token: token,
      };
    } catch (e) {
      Logger.error(e.message);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }
}
