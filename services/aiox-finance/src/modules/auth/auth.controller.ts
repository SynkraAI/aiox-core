import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService, SignUpResponse, SignInResponse } from './auth.service';
import { JwtAuthGuard } from '@src/guards/jwt.guard';
import {
  CurrentUser,
  type CurrentUser as CurrentUserType,
} from '@src/decorators/current-user.decorator';
import { z } from 'zod';

const SignUpSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['ADMIN', 'FINANCEIRO', 'GESTOR', 'COMERCIAL', 'AUDITOR']),
});

const SignInSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type SignUpInput = z.infer<typeof SignUpSchema>;
type SignInInput = z.infer<typeof SignInSchema>;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(
    @Body() body: SignUpInput
  ): Promise<{ success: boolean; data?: SignUpResponse; error?: string; details?: any }> {
    try {
      const validated = SignUpSchema.parse(body);
      const result = await this.authService.signup(validated);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() body: SignInInput
  ): Promise<{ success: boolean; data?: SignInResponse; error?: string; details?: any }> {
    try {
      const validated = SignInSchema.parse(body);
      const result = await this.authService.signin(validated);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signin failed',
      };
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: CurrentUserType
  ): Promise<{ success: boolean; message: string }> {
    await this.authService.logout(user.id);
    return {
      success: true,
      message: `User ${user.id} logged out successfully`,
    };
  }
}
