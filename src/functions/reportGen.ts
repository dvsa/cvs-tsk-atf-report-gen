import { Callback, Context, Handler } from "aws-lambda";
import { AWSError, DynamoDB, Lambda } from "aws-sdk";
import { ManagedUpload } from "aws-sdk/clients/s3";
import { ERRORS } from "../assets/enum";
import { ActivitiesService } from "../services/ActivitiesService";
import { LambdaService } from "../services/LambdaService";
import { ReportGenerationService } from "../services/ReportGenerationService";
import { SendATFReport } from "../services/SendATFReport";
import { TestResultsService } from "../services/TestResultsService";

/**
 * λ function to process a DynamoDB stream of test results into a queue for certificate generation.
 * @param event - DynamoDB Stream event
 * @param context - λ Context
 * @param callback - callback function
 */
const reportGen: Handler = async (event: any, context?: Context, callback?: Callback): Promise<void | ManagedUpload.SendData[]> => {
  if (!event || !event.Records || !Array.isArray(event.Records) || !event.Records.length) {
    console.error("ERROR: event is not defined.");
    throw new Error(ERRORS.EVENT_IS_EMPTY);
  }
  const lambdaService = new LambdaService(new Lambda());
  const reportService: ReportGenerationService = new ReportGenerationService(new TestResultsService(lambdaService), new ActivitiesService(lambdaService));
  const atfReportPromises: Array<Promise<ManagedUpload.SendData>> = [];

  const sendATFReport: SendATFReport = new SendATFReport();

  event.Records.forEach((record: any) => {
    const visit: any = processRecord(record);
    console.log(JSON.stringify(visit));
    const atfReportPromise = reportService
      .generateATFReport(visit)
      .then((generationServiceResponse) => {
        return sendATFReport.sendATFReport(generationServiceResponse, visit);
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });

    atfReportPromises.push(atfReportPromise);
  });

  return Promise.all(atfReportPromises).catch((error: AWSError) => {
    console.error(error);
    throw error;
  });
};

const processRecord = (record: any) => {
  const recordBody = JSON.parse(JSON.parse(record).Message) ?? "";
  if (
    recordBody.eventName === "MODIFY"
    && recordBody.dynamodb
    && recordBody.dynamodb.NewImage
  ) {
    return DynamoDB.Converter.unmarshall(recordBody.dynamodb.NewImage);
  }
  return undefined;
};

export { reportGen };
