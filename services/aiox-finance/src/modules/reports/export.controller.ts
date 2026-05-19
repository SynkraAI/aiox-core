import {
  Controller,
  Get,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FinancialService } from './financial.service';
import { ReportExportValidator } from '@/common/validators/report-export.validator';
import { ExportReportDto } from './dto/export-report.dto';

@Controller('api/reports')
export class ExportController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('export')
  async exportReport(
    @Query('period') period?: string,
    @Query('product_id') productId?: string,
    @Query('seller_id') sellerId?: string
  ): Promise<ExportReportDto> {
    try {
      // Validate query parameters
      if (!period) {
        throw new BadRequestException('Missing required parameter: period');
      }

      const query = ReportExportValidator.validate({
        period,
        product_id: productId,
        seller_id: sellerId,
      });

      // Generate and return report
      const report = await this.financialService.generateExportReport(query);

      return report;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const requestId = uuidv4();
      console.error(`[${requestId}] Export report error:`, error);

      throw new InternalServerErrorException({
        statusCode: 500,
        message: 'Failed to generate export report',
        requestId,
      });
    }
  }
}
