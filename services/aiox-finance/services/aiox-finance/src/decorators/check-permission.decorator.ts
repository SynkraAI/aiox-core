import { SetMetadata } from '@nestjs/common';

export const CheckPermission = (resource: string, action: string) => {
  const setResource = SetMetadata('permission_resource', resource);
  const setAction = SetMetadata('permission_action', action);
  return (target: object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    setResource(target, propertyKey as string | symbol, descriptor);
    setAction(target, propertyKey as string | symbol, descriptor);
    return descriptor || target;
  };
};
