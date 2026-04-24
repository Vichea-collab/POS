// ================================================================>> Core Library
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
// ================================================================>> Costom Library
import { JsReportService } from '@app/services/js-report.service';
import OrderDetails from '@app/models/order/detail.model';
import Order from '@app/models/order/order.model';
import Product from '@app/models/product/product.model';
import User from '@app/models/user/user.model';

@Injectable()
export class InvoiceService {
    constructor(private jsReportService: JsReportService) { }
    private readonly fileBaseUrl = process.env.FILE_BASE_URL || '';

    private getInvoiceTemplate(): string {
        return process.env.JS_TEMPLATE || 'invoice-main';
    }

    private getFileUrl(path?: string): string {
        if (!path) {
            return '';
        }

        if (/^https?:\/\//i.test(path)) {
            return path;
        }

        const baseUrl = this.fileBaseUrl.replace(/\/+$/, '');
        const imagePath = path.replace(/^\/+/, '');

        return baseUrl ? `${baseUrl}/${imagePath}` : imagePath;
    }

    // Method to generate an invoice report
    async generateReport(receiptNumber: number) {
        const dataWithServiceTitle = await this.getInvoiceData(receiptNumber);
        const template = this.getInvoiceTemplate();

        try {
            // Generating the report using the JsReportService
            const result = await this.jsReportService.generateReport(template, dataWithServiceTitle);
            if (result.error) {
                throw new BadRequestException(result.error);
            }
            return result;
        } catch (error) {
            // Log the error or handle it in a more appropriate way
            throw new BadRequestException(error?.message || 'Failed to generate the report');
        }
    }

    async generateReportBuffer(receiptNumber: number): Promise<Buffer> {
        const dataWithServiceTitle = await this.getInvoiceData(receiptNumber);
        const template = this.getInvoiceTemplate();

        try {
            return await this.jsReportService.generateReportBuffer(template, dataWithServiceTitle);
        } catch (error) {
            throw new BadRequestException(error?.message || 'Failed to generate the report');
        }
    }

    private async getInvoiceData(receiptNumber: number) {
        // Retrieving orders related to the specified receipt number
        const orders = await Order.findAll({
            where: {
                receipt_number: String(receiptNumber),
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name'],
                },
                {
                    model: OrderDetails,
                    attributes: ['id', 'unit_price', 'qty'],
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'image'],
                        }
                    ]
                },
            ],
            order: [['id', 'DESC']],
        });

        if (!orders || orders.length === 0) {
            throw new NotFoundException('Order not found');
        }

        let total = 0;
        orders.forEach((row) => {
            total += row.total_price;
        });

        // Structuring the data for the report
        const data: any = orders[0].toJSON();
        data.details = (data.details || []).map((detail) => ({
            ...detail,
            product: detail.product
                ? {
                    ...detail.product,
                    image_url: this.getFileUrl(detail.product.image),
                }
                : detail.product,
        }));

        const dataWithServiceTitle = {
            ...data,
            title_of_service: 'CamCyber POS',
            file_base_url: this.fileBaseUrl,
        };
        return dataWithServiceTitle;
    }


    async generateReportBaseOnStartDateAndEndDate(startDate: string, endDate: string) {
        // Retrieving orders within the specified date range
        const orders = await Order.findAll({
            where: {
                ordered_at: {
                    [Op.between]: [startDate, endDate],
                },
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name'],
                },
                {
                    model: OrderDetails,
                    attributes: ['id', 'unit_price', 'qty'],
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'image'],
                        }
                    ]
                },
            ],
            order: [['id', 'DESC']],
        });

        // Handling case when no orders are found
        if (!orders || orders.length === 0) {
            return { message: 'No orders found within the specified date range' };
        }

        // Calculating the total price of all orders
        let total = 0;
        orders.forEach((row) => {
            total += row.total_price;
        });

        // Structuring the data for the report
        const data = orders.map(order => order.toJSON()); // Convert Sequelize instances to plain objects

        const dataWithServiceTitle = data.map(order => ({
            ...order,
            title_of_service: 'Car Service',
        }));

        // Get the report template
        const template = this.getInvoiceTemplate();

        try {
            // Generating the report using the JsReportService
            const result = await this.jsReportService.generateReport(template, dataWithServiceTitle);
            if (result.error) {
                throw new BadRequestException(result.error);
            }

            // Returning the generated report
            return result;
        } catch (error) {
            // Log the error or handle it in a more appropriate way
            throw new BadRequestException(error?.message || 'Failed to generate the report');
        }
    }

}
