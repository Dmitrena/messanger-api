import { RedisModule } from '@app/shared';
import { CacheModule, Module } from '@nestjs/common';
import { SharedModule } from '../../../libs/shared/src/modules/shared.module';
import { PresenceController } from './presence.controller';
import { PresenceGateway } from './presence.gateway';
import { PresenceService } from './presence.service';

@Module({
  imports: [
    CacheModule.register(),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    RedisModule,
  ],
  controllers: [PresenceController],
  providers: [PresenceService, PresenceGateway],
})
export class PresenceModule {}
