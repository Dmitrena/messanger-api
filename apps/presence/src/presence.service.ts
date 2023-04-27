import { RedisCacheService } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { IActiveUser } from './interfaces/ActiveUser.interface';

@Injectable()
export class PresenceService {
  constructor(private readonly cache: RedisCacheService) {}

  getFoo() {
    console.log('NOT CACHED!');
    return { foo: 'bar' };
  }

  async getActiveUser(id: number) {
    const user = await this.cache.get(`user ${id}`);

    return user as IActiveUser | undefined;
  }
}
