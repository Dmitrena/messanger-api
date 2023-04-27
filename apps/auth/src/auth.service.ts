import { UserRepositoryInterface } from '@app/shared';
import { UserJwt } from '@app/shared/interfaces/user-jwt.interface';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { FriendRequestEntity } from '../../../libs/shared/src/entities/friend-request.entity';
import { FriendRequestsRepository } from './../../../libs/shared/src/repositories/friend-request.repository';

import { UserEntity } from '../../../libs/shared/src/entities/user.entity';
import { AuthDto } from './dto/authDto';
import { CreateUserDto } from './dto/create-user.dto';
import { RefreshTokenDto } from './dto/refrehsToken.dto';
import { AuthServiceInterface } from './interface/auth.service.interface';

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UserRepositoryInterface,
    @Inject('FriendRequestsRepositoryInterface')
    private readonly friendRequestsRepository: FriendRequestsRepository,
    private readonly jwtService: JwtService,
  ) {}

  async getUsers() {
    return this.usersRepository.findAll();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneById(id);
    if (!user) throw new NotFoundException('User not found!');

    return user;
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.findByCondition({
      where: { email },
    });
  }

  hashData(data: string): Promise<string> {
    return argon2.hash(data);
  }

  async signup(dto: CreateUserDto) {
    const existUserByEmail = await this.findByEmail(dto.email);
    if (existUserByEmail)
      throw new ConflictException('User with this email is already exist!');
    const hashPass = await this.hashData(dto.password);
    const newUser = await this.usersRepository.save({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      hash: hashPass,
    });

    const tokens = await this.issueTokenPair(newUser);

    return { ...tokens, newUser };
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.findByEmail(email);

    const doesUserExist = !!user;

    if (!doesUserExist) return null;

    const doesPasswordMatch = await argon2.verify(user.hash, password);

    if (!doesPasswordMatch) return null;

    return user;
  }

  async signin(dto: AuthDto) {
    const user = await this.validateUser(dto.email, dto.password);

    if (!user) throw new UnauthorizedException();

    const tokens = await this.issueTokenPair(user);
    return { ...tokens, user };
  }

  async getNewTokens({ refreshToken: refreshToken }: RefreshTokenDto) {
    if (!refreshToken) throw new UnauthorizedException();

    const res = await this.jwtService.verifyAsync(refreshToken);
    if (!res) throw new UnauthorizedException();

    const user = await this.findOne(res.user.id);

    const tokens = await this.issueTokenPair(user);

    return { ...tokens, user };
  }

  async issueTokenPair(user: UserEntity) {
    const refreshToken = await this.jwtService.signAsync(
      { user },
      {
        expiresIn: 60 * 15 * 10,
      },
    );

    const accessToken = await this.jwtService.signAsync(
      { user },
      {
        expiresIn: 60 * 15,
      },
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException();
    }

    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt);
      return { user, exp };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return;

    try {
      return this.jwtService.decode(jwt) as UserJwt;
    } catch (error) {
      if (error) throw new BadRequestException();
    }
  }

  async addFriend(
    userId: number,
    friendId: number,
  ): Promise<FriendRequestEntity> {
    const creator = await this.findOne(userId);
    const receiver = await this.findOne(friendId);

    return await this.friendRequestsRepository.save({ creator, receiver });
  }

  async getFriends(userId: number): Promise<FriendRequestEntity[]> {
    const creator = await this.findOne(userId);

    return await this.friendRequestsRepository.findWithRelations({
      where: [{ creator }, { receiver: creator }],
      relations: ['creator', 'receiver'],
    });
  }

  async getFriendsList(userId: number) {
    const friendRequests = await this.getFriends(userId);

    if (!friendRequests) return [];

    const friends = friendRequests.map((friendRequest) => {
      const isUserCreator = userId === friendRequest.creator.id;
      const friendDetails = isUserCreator
        ? friendRequest.receiver
        : friendRequest.creator;

      const { id, firstName, lastName, email } = friendDetails;

      return {
        id,
        email,
        firstName,
        lastName,
      };
    });

    return friends;
  }

  async getTokens(userId: number, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'AT_SECRET',
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'RT_SECRET',
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
