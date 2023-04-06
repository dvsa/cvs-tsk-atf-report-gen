import { AWSError } from "aws-sdk";
import { HTTPError } from "../models/HTTPError";
// @ts-ignore
import { NotifyClient } from "notifications-node-client";
import { Configuration } from "../utils/Configuration";
import { EMAIL_TYPE } from "../assets/enum";


/**
 * Service class for Certificate Notifications
 */
class NotificationService {
  private readonly notifyClient: NotifyClient;
  private readonly config: Configuration;

  constructor(notifyClient: NotifyClient) {
    this.notifyClient = notifyClient;
    this.config = Configuration.getInstance();
  }

  /**
   * Sending email with the certificate according to the given params
   * @param params - personalization details,email and certificate
   * @param emails - emails to send to
   * @param emailType - email receiver type
   */
  public async sendNotification(params: any, emails: string[], emailType: string): Promise<any[]> {
    const templateId: string = await this.config.getTemplateIdFromEV();
    const emailDetails = {
      personalisation: params,
    };
    const sendEmailPromise = [];

    for (const email of emails) {
      const sendEmail = this.notifyClient.sendEmail(templateId, email, emailDetails)
        .then((response: any) => response.data);
      sendEmailPromise.push(sendEmail);
    }
    if (emailType === EMAIL_TYPE.ATF) {
      console.log(`report successfully sent to ATF for PNumber ${params.testStationPNumber} with activity ${params.id}.`);
    } else if (emailType === EMAIL_TYPE.VSA) {
      console.log(`report successfully sent to VSA for PNumber ${params.testStationPNumber} with activity ${params.id}.`);
    }

    return Promise.all(sendEmailPromise).catch((error: AWSError) => {
      console.error(error);
      throw new HTTPError(error.statusCode, error.message);
    });
  }
}

export { NotificationService };
