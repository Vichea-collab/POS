// ===========================================================================>> Core Library
import { BadRequestException, Controller, Get, Param, Query, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';

// ===========================================================================>> Costom Library
import { InvoiceService } from './invoice.service';

@Controller()
export class InvoiceController {
    
    constructor(private readonly _service: InvoiceService) { };

    @Get('order-invoice/:receiptNumber')
    async generateReport(
        @Param('receiptNumber') receiptNumber: string,
        @Query('download') download: string,
        @Res({ passthrough: true }) response: Response
    ) {
        const parsedReceiptNumber = Number(receiptNumber);

        if (!Number.isInteger(parsedReceiptNumber)) {
            throw new BadRequestException('Id must be a number');
        }

        if (download === 'true') {
            const reportBuffer = await this._service.generateReportBuffer(parsedReceiptNumber);
            const fileName = `Invoice-${parsedReceiptNumber}.pdf`;

            response.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Length': reportBuffer.length,
                'Cache-Control': 'no-store',
            });

            return new StreamableFile(reportBuffer);
        }

        return this._service.generateReport(parsedReceiptNumber);
    }
}
