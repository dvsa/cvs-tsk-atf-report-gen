import DynamoDB from "aws-sdk/clients/dynamodb";

export const processRecord = (record: any) => {
    const recordBody = JSON.parse(record.body).Message;
    console.log("record body is, ", recordBody);
    console.log("record eventName is, ", recordBody.eventName);
    console.log("record dynamodb is, ", recordBody.dynamodb);
    console.log("record new image is, ", recordBody.dynamodb.NewImage);
    console.log(recordBody.eventName === "MODIFY");
    console.log(!!recordBody.dynamodb);
    console.log(!!recordBody.dynamodb.NewImage);
    console.log(
        recordBody.eventName === "MODIFY"
        && recordBody.dynamodb
        && recordBody.dynamodb.NewImage
    );
    if (
      recordBody.eventName === "MODIFY"
      && recordBody.dynamodb
      && recordBody.dynamodb.NewImage
    ) {
      return DynamoDB.Converter.unmarshall(recordBody.dynamodb.NewImage);
    }
    console.error(`process return undefined, record is ${recordBody}`);
    return undefined;
};
