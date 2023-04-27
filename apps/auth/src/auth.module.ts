import {
  ConversationEntity,
  FriendRequestEntity,
  FriendRequestsRepository,
  MessageEntity,
  PostgresDBModule,
  SharedModule,
  SharedService,
  UserEntity,
  UsersRepository,
} from '@app/shared';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { PassportModule } from '@nestjs/passport';

import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: './.env' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '3600s' },
    }),
    PassportModule,

    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     url: `postgresql://${configService.get(
    //       'POSTGRES_USER',
    //     )}:${configService.get(
    //       'POSTGRES_PASSWORD',
    //     )}@postgres:5432/${configService.get('POSTGRES_DB')}`,
    //     autoLoadEntities: true,
    //     synchronize: true,
    //   }),
    // }),

    //   useFactory: () => ({
    //     ...dataSourceOption,
    //     synchronize: true,
    //     autoLoadEntities: true,
    //   }),
    //   inject: [ConfigService],
    // }),
    SharedModule,
    PostgresDBModule,
    TypeOrmModule.forFeature([
      UserEntity,
      FriendRequestEntity,
      ConversationEntity,
      MessageEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    JwtAuthGuard,

    {
      provide: 'AuthServiceInterface',
      useClass: AuthService,
    },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'FriendRequestsRepositoryInterface',
      useClass: FriendRequestsRepository,
    },
  ],
})
export class AuthModule {}
