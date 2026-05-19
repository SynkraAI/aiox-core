import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '@src/guards/jwt.guard';
import { CurrentUser } from '@src/decorators/current-user.decorator';
import { z } from 'zod';

interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

const GrantPermissionSchema = z.object({
  resource: z.string().min(1),
  action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE']),
  roleTarget: z.string().min(1),
});

const RevokePermissionSchema = z.object({
  resource: z.string().min(1),
  action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE']),
  roleTarget: z.string().min(1),
});

@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Post('grant')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async grantPermission(@Body() body: any, @CurrentUser() user: JwtPayload) {
    try {
      const result = GrantPermissionSchema.safeParse(body);
      if (!result.success) {
        return {
          success: false,
          error: 'Validation failed',
        };
      }

      if (user.role !== 'ADMIN') {
        return {
          success: false,
          error: 'Only ADMIN can grant permissions',
        };
      }

      await this.permissionsService.grantPermission(
        user.sub,
        result.data.resource,
        result.data.action
      );

      return {
        success: true,
        message: `Permission granted for ${result.data.action} on ${result.data.resource}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to grant permission: ${message}`,
      };
    }
  }

  @Delete('revoke')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokePermission(@Body() body: any, @CurrentUser() user: JwtPayload) {
    try {
      const result = RevokePermissionSchema.safeParse(body);
      if (!result.success) {
        return {
          success: false,
          error: 'Validation failed',
        };
      }

      if (user.role !== 'ADMIN') {
        return {
          success: false,
          error: 'Only ADMIN can revoke permissions',
        };
      }

      await this.permissionsService.revokePermission(
        user.sub,
        result.data.resource,
        result.data.action
      );

      return {
        success: true,
        message: `Permission revoked for ${result.data.action} on ${result.data.resource}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Failed to revoke permission: ${message}`,
      };
    }
  }
}
