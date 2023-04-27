import { UserJwt } from '@app/shared';
import { FriendRequestEntity } from '../../../../libs/shared/src/entities/friend-request.entity';
import { UserEntity } from '../../../../libs/shared/src/entities/user.entity';
import { AuthDto } from '../dto/authDto';
import { CreateUserDto } from '../dto/create-user.dto';
export interface AuthServiceInterface {
  getUsers(): Promise<UserEntity[]>;
  findByEmail(email: string): Promise<UserEntity>;
  hashData(data: string): Promise<string>;
  signup(dto: CreateUserDto): Promise<{
    access_token: string;
    refresh_token: string;
    newUser: UserEntity;
  }>;
  signin(dto: AuthDto): Promise<{
    access_token: string;
    refresh_token: string;
    user: UserEntity;
  }>;
  validateUser(email: string, password: string): Promise<UserEntity>;
  verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }>;
  getUserFromHeader(jwt: string): Promise<UserJwt>;
  addFriend(userId: number, friendId: number): Promise<FriendRequestEntity>;
  getFriends(userId: number): Promise<FriendRequestEntity[]>;
}
