import { AuthGuard, UserInterceptor, UserRequest } from '@app/shared';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { AuthDto } from 'apps/auth/src/dto/authDto';
import { CreateUserDto } from 'apps/auth/src/dto/create-user.dto';
import { RefreshTokenDto } from 'apps/auth/src/dto/refrehsToken.dto';
import { CurrentUserId } from './decorator';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private presenceService: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Get('users')
  async getUsers() {
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {},
    );
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('add-friend/:friendId')
  async addFriend(
    @Req() req: UserRequest,
    @Param('friendId') friendId: number,
  ) {
    if (!req?.user) throw new BadRequestException();

    return this.authService.send(
      {
        cmd: 'add-friend',
      },
      {
        userId: req.user.id,
        friendId,
      },
    );
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Get('get-friends')
  async getFriends(@CurrentUserId() userId: number) {
    return this.authService.send(
      {
        cmd: 'get-friends',
      },
      {
        userId: userId,
      },
    );
  }

  @Get('auth/by')
  async findBy() {
    return this.authService.send(
      {
        cmd: 'find-by',
      },
      {},
    );
  }

  @Get('presence')
  async getPresence() {
    return this.presenceService.send(
      {
        cmd: 'get-presence',
      },
      {},
    );
  }

  @Post('auth/signup')
  async signup(@Body() dto: CreateUserDto) {
    return this.authService.send(
      {
        cmd: 'signup',
      },
      {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: dto.password,
      },
    );
  }

  @Post('auth/signin')
  async signin(@Body() dto: AuthDto) {
    return this.authService.send(
      {
        cmd: 'signin',
      },
      {
        email: dto.email,
        password: dto.password,
      },
    );
  }

  @Post('auth/refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.send(
      {
        cmd: 'refresh',
      },
      {
        refreshToken: dto.refreshToken,
      },
    );
  }
}
