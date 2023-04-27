import { SharedService } from '@app/shared';
import { Controller, Inject, UseGuards } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/authDto';
import { CreateUserDto } from './dto/create-user.dto';
import { RefreshTokenDto } from './dto/refrehsToken.dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller()
export class AuthController {
  constructor(
    @Inject('AuthServiceInterface') private readonly authService: AuthService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'get-users' })
  async getUser(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getUsers();
  }

  @MessagePattern({ cmd: 'get-user' })
  async getUserById(
    @Ctx() context: RmqContext,
    @Payload() user: { id: number },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.findOne(user.id);
  }

  @MessagePattern({ cmd: 'signup' })
  async signup(@Ctx() context: RmqContext, @Payload() dto: CreateUserDto) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.signup(dto);
  }

  @MessagePattern({ cmd: 'signin' })
  async signin(@Ctx() context: RmqContext, @Payload() dto: AuthDto) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.signin(dto);
  }

  @MessagePattern({ cmd: 'refresh' })
  async refreshToken(
    @Ctx() context: RmqContext,
    @Payload() dto: RefreshTokenDto,
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getNewTokens(dto);
  }

  @MessagePattern({ cmd: 'verify-jwt' })
  @UseGuards(JwtAuthGuard)
  async verifyJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.verifyJwt(payload.jwt);
  }

  @MessagePattern({ cmd: 'issue-token-pair' })
  @UseGuards(JwtAuthGuard)
  async issueTokenPair(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.verifyJwt(payload.jwt);
  }

  @MessagePattern({ cmd: 'decode-jwt' })
  async decodeJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getUserFromHeader(payload.jwt);
  }

  @MessagePattern({ cmd: 'add-friend' })
  async addFriend(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: number; friendId: number },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.addFriend(payload.userId, payload.friendId);
  }

  @MessagePattern({ cmd: 'get-friends' })
  async getFriends(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: number },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getFriends(payload.userId);
  }

  @MessagePattern({ cmd: 'get-friends-list' })
  async getFriendsList(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: number },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getFriendsList(payload.userId);
  }
}
