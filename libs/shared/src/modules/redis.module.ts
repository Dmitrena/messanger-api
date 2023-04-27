import { CacheModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { redisStore } from 'cache-manager-redis-yet';
import { RedisCacheService } from '../services/redis-cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: `redis://default:${configService.get<string>(
            'REDIS_PASS',
          )}@redis:6379`,
          ttl: 50000,
        }),
      }),
      isGlobal: true,
      inject: [ConfigService],
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisModule {}
