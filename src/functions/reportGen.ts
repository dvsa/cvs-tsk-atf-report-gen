import { LambdaClient } from "@aws-sdk/client-lambda";
import { PutObjectRequest } from "@aws-sdk/client-s3";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { Callback, Context, Handler } from "aws-lambda";
import { ERRORS } from "../assets/enum";
import { ActivitiesService } from "../services/ActivitiesService";
import { LambdaService } from "../services/LambdaService";
import { ReportGenerationService } from "../services/ReportGenerationService";
import { SendATFReport } from "../services/SendATFReport";
import { TestResultsService } from "../services/TestResultsService";

/**
 * λ function to process a SQS of test results into a queue for certificate generation.
 * @param event - SQS event
 * @param context - λ Context
 * @param callback - callback function
 */
const reportGen: Handler = async (event: any, context?: Context, callback?: Callback): Promise<void | PutObjectRequest[]> => {
  if (!event || !event.Records || !Array.isArray(event.Records) || !event.Records.length) {
    console.error("ERROR: event is not defined.");
    throw new Error(ERRORS.EVENT_IS_EMPTY);
  }
  const lambdaService = new LambdaService(new LambdaClient({}));
  const reportService: ReportGenerationService = new ReportGenerationService(new TestResultsService(lambdaService), new ActivitiesService(lambdaService));
  const sendATFReport: SendATFReport = new SendATFReport();

  console.debug("Services injected, looping over sqs events");
  try {
    for (const record of event.Records) {
      const recordBody = JSON.parse(record?.body);
      const visit: any = unmarshall(recordBody?.dynamodb.NewImage);

      console.debug(`visit is: ${JSON.stringify(visit)}`);

      if (visit) {
        const generationServiceResponse = await reportService.generateATFReport(visit);
        console.debug(`Report generated: ${generationServiceResponse}`);
        await sendATFReport.sendATFReport(generationServiceResponse, visit);
        console.debug("All emails sent, terminating lambda");
      }
    }
  } catch(error) {
    console.error(error);
    throw error;
  }
};

export { reportGen };
