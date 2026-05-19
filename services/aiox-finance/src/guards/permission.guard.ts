import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '@src/modules/permissions/permissions.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<string>('permission_resource', context.getHandler());
    const action = this.reflector.get<string>('permission_action', context.getHandler());

    if (!resource || !action) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('Unauthorized: No user context');
    }

    const hasPermission = await this.permissionsService.checkPermission(user.sub, resource, action);

    if (!hasPermission) {
      throw new ForbiddenException(`Forbidden: No permission for ${action} on ${resource}`);
    }

    return true;
  }
}
