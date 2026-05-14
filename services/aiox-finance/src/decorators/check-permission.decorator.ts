import { SetMetadata } from '@nestjs/common';

export const CheckPermission = (resource: string, action: string) => {
  return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    SetMetadata('permission_resource', resource)(target, propertyKey as any, descriptor as any);
    SetMetadata('permission_action', action)(target, propertyKey as any, descriptor as any);
    return descriptor;
  };
};
