import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  createParamDecorator,
} from '@nestjs/common';

@Injectable()
export class StoreGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role === 'STAFF') {
      request.store_id = user.store_id;
      if (!request.store_id) {
        throw new ForbiddenException('Staff belum di-assign ke toko');
      }
    } else if (user.role === 'SUPERADMIN') {
      const headerStoreId = request.headers['x-store-id'];
      request.store_id = headerStoreId ? Number(headerStoreId) : null;
    }

    return true;
  }
}

export const StoreId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().store_id;
  },
);
