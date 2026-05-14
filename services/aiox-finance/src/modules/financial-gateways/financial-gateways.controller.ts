import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/guards/jwt.guard';
import { PermissionGuard } from '@/guards/permission.guard';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { FinancialGatewaysService } from './financial-gateways.service';
import { CreateGatewayDto, CreateGatewaySchema } from './dto/create-gateway.dto';
import { UpdateGatewayDto, UpdateGatewaySchema } from './dto/update-gateway.dto';
import { GatewayResponseDto } from './dto/gateway-response.dto';

@Controller('api/financial-gateways')
export class FinancialGatewaysController {
  constructor(private readonly service: FinancialGatewaysService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: unknown,
    @CurrentUser() user: { id: string; role: string }
  ): Promise<{ statusCode: number; data: GatewayResponseDto }> {
    try {
      const dto = CreateGatewaySchema.parse(body);
      const data = await this.service.create(dto, user.id);
      return { statusCode: 201, data };
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const zodIssues = (error as any).issues ?? (error as any).errors ?? [];
        const fieldErrors = zodIssues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
        throw new BadRequestException(`Validation failed: ${fieldErrors.join('; ')}`);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.getResponse());
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.getResponse());
      }
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.getResponse());
      }
      throw new InternalServerErrorException({
        message: 'Failed to create gateway',
        requestId: this.generateRequestId(),
      });
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<{ statusCode: number; data: GatewayResponseDto[]; total: number }> {
    try {
      const result = await this.service.findAll();
      return { statusCode: 200, ...result };
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Failed to fetch gateways',
        requestId: this.generateRequestId(),
      });
    }
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  async findActive(): Promise<{ statusCode: number; data: GatewayResponseDto[] }> {
    try {
      const data = await this.service.findActive();
      return { statusCode: 200, data };
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Failed to fetch active gateways',
        requestId: this.generateRequestId(),
      });
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(
    @Param('id') id: string
  ): Promise<{ statusCode: number; data: GatewayResponseDto }> {
    try {
      const data = await this.service.findById(id);
      return { statusCode: 200, data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to fetch gateway',
        requestId: this.generateRequestId(),
      });
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: { id: string; role: string }
  ): Promise<{ statusCode: number; data: GatewayResponseDto }> {
    try {
      const dto = UpdateGatewaySchema.parse(body);
      const data = await this.service.update(id, dto, user.id);
      return { statusCode: 200, data };
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const zodIssues = (error as any).issues ?? (error as any).errors ?? [];
        const fieldErrors = zodIssues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
        throw new BadRequestException(`Validation failed: ${fieldErrors.join('; ')}`);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.getResponse());
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.getResponse());
      }
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.getResponse());
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to update gateway',
        requestId: this.generateRequestId(),
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string }
  ): Promise<{ statusCode: number; message: string }> {
    try {
      const result = await this.service.delete(id, user.id);
      return { statusCode: 200, ...result };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to delete gateway',
        requestId: this.generateRequestId(),
      });
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
