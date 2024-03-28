const mockProcessRecord = jest.fn();

import { reportGen } from "../../src/functions/reportGen";
import { ReportGenerationService } from "../../src/services/ReportGenerationService";
import { SendATFReport } from "../../src/services/SendATFReport";
// import mockConfig from "../util/mockConfig";

jest.mock("../../src/services/ReportGenerationService");
jest.mock("../../src/services/SendATFReport");
jest.mock("../../src/utils/sqsProcess.ts", () => ({
  processRecord: mockProcessRecord
}));

describe("Retro Gen Function", () => {
  beforeAll(() => jest.setTimeout(60000));
  afterAll(() => {
    jest.setTimeout(5000);
    return new Promise((r) => setTimeout(r, 0));
  });
  // const ctx = mockContext();
  // mockConfig();
  const ctx = {};
  context("Receiving an empty event (of various types)", () => {
    it("should throw errors (event = {})", async () => {
      expect.assertions(1);
      try {
        await reportGen({}, ctx as any, () => {
          return;
        });
      } catch (e) {
        expect(e.message).toEqual("Event is empty");
      }
    });
    it("should throw errors (event = null)", async () => {
      expect.assertions(1);
      try {
        await reportGen(null, ctx as any, () => {
          return;
        });
      } catch (e) {
        expect(e.message).toEqual("Event is empty");
      }
    });
    it("should throw errors (event has no records)", async () => {
      expect.assertions(1);
      try {
        await reportGen({ something: true }, ctx as any, () => {
          return;
        });
      } catch (e) {
        expect(e.message).toEqual("Event is empty");
      }
    });
    it("should throw errors (event Records is not array)", async () => {
      expect.assertions(1);
      try {
        await reportGen({ Records: true }, ctx as any, () => {
          return;
        });
      } catch (e) {
        expect(e.message).toEqual("Event is empty");
      }
    });
    it("should throw errors (event Records array is empty)", async () => {
      expect.assertions(1);
      try {
        await reportGen({ Records: [] }, ctx as any, () => {
          return;
        });
      } catch (e) {
        expect(e.message).toEqual("Event is empty");
      }
    });
  });

  context("Inner services fail", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("Should throw an error (generateATFReport fails)", async () => {
      ReportGenerationService.prototype.generateATFReport = jest.fn().mockRejectedValue(new Error("Oh no!"));
      mockProcessRecord.mockReturnValueOnce("All good");
      expect.assertions(1);
      try {
        await reportGen({ Records: [{ body: "test" }] }, ctx as any, () => {
          return;
        });
      } catch (e) {
        expect(e.message).toEqual("Oh no!");
      }
    });
    it("Should throw an error (bucket upload fails)", async () => {
      ReportGenerationService.prototype.generateATFReport = jest.fn().mockResolvedValue("Looking good");
      SendATFReport.prototype.sendATFReport = jest.fn().mockRejectedValue(new Error("Oh dear"));
      mockProcessRecord.mockReturnValueOnce("All good");
      expect.assertions(1);
      try {
        await reportGen({ Records: [{ body: "test" }] }, ctx as any, () => {
          return;
        });
      } catch (e) {
        expect(e.message).toEqual("Oh dear");
      }
    });
  });
});
