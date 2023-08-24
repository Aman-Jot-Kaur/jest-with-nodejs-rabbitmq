const { validateswiftPatternCode } = require("../../middlewares/validateswiftPatternCode ");
const { validateUUID } = require("../../middlewares/validateUuid");
const httpMocks = require("node-mocks-http");

describe("validateswiftPatternCode Middleware", () => {
  // ...existing test cases for validateswiftPatternCode

  it("should pass if valid UUID provided", () => {
    const mockRequest = httpMocks.createRequest({
      params: {
        uuid: "55610f03-37bc-4383-92ca-8fd2a408e93a",
      },
    });
    const mockResponse = httpMocks.createResponse();
    const mockNext = jest.fn();

    validateUUID(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled(); // Middleware should call next for valid UUID
    expect(mockResponse.statusCode).toBe(200);
  });

  it("should return 400 if invalid UUID format provided", () => {
    const mockRequest = httpMocks.createRequest({
      params: {
        uuid: "invalid-uuid-format",
      },
    });
    const mockResponse = httpMocks.createResponse();
    const mockNext = jest.fn();

    validateUUID(mockRequest, mockResponse, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.statusCode).toBe(400);
    expect(mockResponse._getJSONData()).toEqual({
      error: "Invalid UUID format",
    });
  });
});
