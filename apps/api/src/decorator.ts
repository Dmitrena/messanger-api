import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): number => {
    const user = ctx.switchToHttp().getRequest().user;

    if (!user) return null;

    return user['id'];
  },
);
