/* eslint-disable @typescript-eslint/no-empty-interface */
import { BaseInterfaceRepository } from '@app/shared';
import { UserEntity } from '@app/shared/entities/user.entity';

export interface UserRepositoryInterface
  extends BaseInterfaceRepository<UserEntity> {}
