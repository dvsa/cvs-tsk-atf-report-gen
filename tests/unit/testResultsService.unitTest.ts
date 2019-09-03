import { expect } from "chai";
import { Injector } from "../../src/models/injector/Injector";
import { LambdaMockService } from "../models/LambdaMockService";
import { TestResultsService } from "../../src/services/TestResultsService";

describe("TestResultsService", () => {
    const testResultsService: TestResultsService = Injector.resolve<TestResultsService>(TestResultsService, [LambdaMockService]);
    LambdaMockService.populateFunctions();

    context("when fetching the test results", () => {
        context("and the lambda function exists", () => {
            context("and the response is 200", () => {
                it("should return a correct test result", () => {
                    return testResultsService.getTestResults({})
                        .then((result: any) => {
                            const expectedResult: any = [
                                {
                                    testerStaffId: "1",
                                    vrm: "JY58FPP",
                                    testStationPNumber: "87-1369569",
                                    numberOfSeats: 45,
                                    testStartTimestamp: "2019-01-14T10:36:33.987Z",
                                    testEndTimestamp: "2019-01-14T10:36:33.987Z",
                                    testTypes: {
                                        prohibitionIssued: false,
                                        testCode: "aas",
                                        testNumber: "1",
                                        lastUpdatedAt: "2019-02-22T08:47:59.269Z",
                                        testAnniversaryDate: "2019-12-22T08:47:59.749Z",
                                        additionalCommentsForAbandon: "none",
                                        numberOfSeatbeltsFitted: 2,
                                        testTypeEndTimestamp: "2019-01-14T10:36:33.987Z",
                                        reasonForAbandoning: "none",
                                        lastSeatbeltInstallationCheckDate: "2019-01-14",
                                        createdAt: "2019-02-22T08:47:59.269Z",
                                        testExpiryDate: "2020-02-21T08:47:59.749Z",
                                        testTypeId: "1",
                                        testTypeStartTimestamp: "2019-01-14T10:36:33.987Z",
                                        certificateNumber: "1234",
                                        testTypeName: "Annual test",
                                        seatbeltInstallationCheckDate: true,
                                        additionalNotesRecorded: "VEHICLE FRONT REGISTRATION PLATE MISSING",
                                        defects: [
                                            {
                                                deficiencyCategory: "major",
                                                deficiencyText: "missing.",
                                                prs: false,
                                                additionalInformation: {
                                                    location: {
                                                        axleNumber: null,
                                                        horizontal: null,
                                                        vertical: null,
                                                        longitudinal: "front",
                                                        rowNumber: null,
                                                        lateral: null,
                                                        seatNumber: null
                                                    },
                                                    notes: "None"
                                                },
                                                itemNumber: 1,
                                                deficiencyRef: "1.1.a",
                                                stdForProhibition: false,
                                                deficiencySubId: null,
                                                imDescription: "Registration Plate",
                                                deficiencyId: "a",
                                                itemDescription: "A registration plate:",
                                                imNumber: 1
                                            }
                                        ],
                                        name: "Annual test",
                                        certificateLink: "http://dvsagov.co.uk",
                                        testResult: "pass"
                                    },
                                    vin: "XMGDE02FS0H012345"
                                }
                            ];

                            expect(result).to.eql(expectedResult);
                        })
                        .catch(() => {
                            expect.fail();
                        });
                });
            });

            context("and the response is non-200", () => {
                it("should throw an error", () => {
                    LambdaMockService.changeResponse("cvs-svc-test-results", "tests/resources/test-results-404-response.json");

                    return testResultsService.getTestResults({})
                        .then(() => {
                            expect.fail();
                        })
                        .catch((error: Error) => {
                            expect(error.message).to.contain("Lambda invocation returned error");
                            expect(error).to.be.instanceOf(Error);
                        });
                });
            });

            context("and the response is 200", () => {
                it("should return an empty test-result", () => {
                    LambdaMockService.changeResponse("cvs-svc-test-results", "tests/resources/test-results-200-response-empty-body.json");

                    return testResultsService.getTestResults({})
                        .then((result: any) => {
                            const expectedResult: any = [];
                            expect(result).to.eql(expectedResult);
                        })
                        .catch((error: Error) => {
                            expect(error.message).to.contain("Lambda invocation returned bad data");
                            expect(error).to.be.instanceOf(Error);
                        });
                });
            });
        });
    });

    context("and the lambda function does not exist", () => {
        it("should throw an error", () => {
            LambdaMockService.purgeFunctions();

            return testResultsService.getTestResults({})
                .then(() => {
                    expect.fail();
                })
                .catch((error: Error) => {
                    expect(error.message).to.equal("Unsupported Media Type");
                    expect(error).to.be.instanceOf(Error);

                    LambdaMockService.populateFunctions();
                });
        });
    });
});