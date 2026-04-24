import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class JsReportService {
    private jsBaseUrl: string = process.env.JS_BASE_URL || 'http://localhost:5488';
    private jsUsername: string = process.env.JS_USERNAME || 'admin';
    private jsPassword: string = process.env.JS_PASSWORD || 'CamCyberTeam';
    private readonly logger = new Logger(JsReportService.name);
    private readonly retryDelayMs = 10_000;

    private getAxiosConfig<T>(templateName: string, data: T): AxiosRequestConfig {
        if (!templateName) {
            throw new Error('JS report template is not configured');
        }

        return {
            url: `${this.jsBaseUrl}/api/report`,
            method: 'post',
            responseType: 'arraybuffer',
            timeout: 120_000,
            auth: {
                username: this.jsUsername,
                password: this.jsPassword,
            },
            data: {
                template: {
                    name: templateName
                },
                data: data
            }
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private shouldRetry(error: unknown): boolean {
        if (!axios.isAxiosError(error)) {
            return false;
        }

        const status = error.response?.status;
        return !status || status === 502 || status === 503 || status === 504;
    }

    private getErrorMessage(error: unknown): string {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            return status ? `jsreport responded with status ${status}` : error.message;
        }

        return error instanceof Error ? error.message : 'Unknown jsreport error';
    }

    async generateReportBuffer<T>(template: string, data: T): Promise<Buffer> {
        let lastError: unknown;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const response: AxiosResponse<Buffer> = await axios(this.getAxiosConfig(template, data));
                return Buffer.from(response.data);
            } catch (error) {
                lastError = error;
                this.logger.warn(`jsreport attempt ${attempt} failed: ${this.getErrorMessage(error)}`);

                if (attempt === 3 || !this.shouldRetry(error)) {
                    break;
                }

                await this.sleep(this.retryDelayMs);
            }
        }

        throw lastError;
    }

    async generateReport<T>(template: string, data: T): Promise<{ data?: string, error?: string }> {
        const result: { data?: string, error?: string } = {};
        try {
            const reportBuffer = await this.generateReportBuffer(template, data);
            result.data = reportBuffer.toString('base64');
        } catch (error) {
            this.logger.error(`Failed to generate the report: ${error.message}`);
            result.error = 'Something when wrong. Failed to generate the report';
        }
        return result;
    }
}
