import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto, CreateSaleSchema } from './dto/create-sale.dto';
import { UpdateSaleDto, UpdateSaleSchema } from './dto/update-sale.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Controller('api/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateSaleDto): Promise<SaleResponseDto> {
    try {
      CreateSaleSchema.parse(dto);
      const userId = uuidv4();
      return await this.salesService.create(dto, userId);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const zodIssues = (error as any).issues ?? (error as any).errors ?? [];
        const fieldErrors = zodIssues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
        throw new BadRequestException(`Validation failed: ${fieldErrors.join('; ')}`);
      }
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to create sale',
        requestId: uuidv4(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('status') status?: string,
    @Query('seller_id') seller_id?: string,
    @Query('financial_gateway_id') financial_gateway_id?: string,
    @Query('period') period?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{ data: SaleResponseDto[]; total: number; page: number; limit: number }> {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 50;

      if (isNaN(pageNum) || pageNum < 1) {
        throw new BadRequestException('page must be a positive integer');
      }
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new BadRequestException('limit must be between 1 and 100');
      }

      const result = await this.salesService.findAll(
        {
          status,
          seller_id,
          financial_gateway_id,
          period,
          page: pageNum,
          limit: limitNum,
        },
        uuidv4()
      );

      return {
        ...result,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to fetch sales',
        requestId: uuidv4(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<SaleResponseDto> {
    try {
      const userId = uuidv4();
      return await this.salesService.findOne(id, userId);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to fetch sale',
        requestId: uuidv4(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSaleDto
  ): Promise<SaleResponseDto> {
    try {
      UpdateSaleSchema.parse(dto);
      const userId = uuidv4();
      return await this.salesService.update(id, dto, userId);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const zodIssues = (error as any).issues ?? (error as any).errors ?? [];
        const fieldErrors = zodIssues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
        throw new BadRequestException(`Validation failed: ${fieldErrors.join('; ')}`);
      }
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to update sale',
        requestId: uuidv4(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ message: string }> {
    try {
      const userId = uuidv4();
      return await this.salesService.delete(id, userId);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'Failed to delete sale',
        requestId: uuidv4(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
