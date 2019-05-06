import { Callback, Context, Handler } from "aws-lambda";
import { Injector } from "../models/injector/Injector";
import { ManagedUpload } from "aws-sdk/clients/s3";
import { ReportGenerationService } from "../services/ReportGenerationService";
import { AWSError } from "aws-sdk";
import { SendATFReport } from "../services/SendATFReport";

/**
 * λ function to process a DynamoDB stream of test results into a queue for certificate generation.
 * @param event - DynamoDB Stream event
 * @param context - λ Context
 * @param callback - callback function
 */
const reportGen: Handler = async (event: any, context?: Context, callback?: Callback): Promise<void | ManagedUpload.SendData[]> => {
    if (!event) {
        console.error("ERROR: event is not defined.");
        return;
    }
    const reportService: ReportGenerationService = Injector.resolve<ReportGenerationService>(ReportGenerationService);
    const retroUploadPromises: Array<Promise<ManagedUpload.SendData>> = [];

    const sendATFReport: SendATFReport = new SendATFReport();

    event.Records.forEach((record: any) => {
        const visit: any = JSON.parse(record.body);
        const retroUploadPromise = reportService.generateATFReport(visit)
        .then((generationServiceResponse: { fileName: string, fileBuffer: Buffer, testResults: any}) => {
            return sendATFReport.sendATFReport(generationServiceResponse, visit);
        })
        .catch((error: any) => {
            console.log(error);
            throw error;
        });

        retroUploadPromises.push(retroUploadPromise);
    });

    return Promise.all(retroUploadPromises)
    .catch((error: AWSError) => {
        console.error(error);
        throw error;
    });
};

export { reportGen };
