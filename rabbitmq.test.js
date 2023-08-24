const amqp = require("amqplib");
const Producer = require("../../producer");

describe("RabbitMQ Should Work Fine", () => {
  let mockConnect, mockCreateChannel;

  beforeAll(() => {
    // Mock amqp.connect and channel creation methods
    mockCreateChannel = jest.fn().mockResolvedValue({});
    mockConnect = jest.spyOn(amqp, "connect").mockResolvedValue({
      createChannel: mockCreateChannel,
    });
  });

  afterAll(() => {
    // Restore the original methods
    mockConnect.mockRestore();
    mockCreateChannel.mockRestore();
  });

  it("should successfully create a channel to RabbitMQ", async () => {
    const producer = new Producer();
    await producer.createChannel();

    // Verify that amqp.connect and channel creation were called
    expect(mockConnect).toHaveBeenCalledWith(process.env.AMQP_URL);
    expect(mockCreateChannel).toHaveBeenCalled();
  });

  it("should handle connection errors appropriately", async () => {
    mockConnect.mockRejectedValue(new Error("Failed to establish RabbitMQ connection"));
    const producer = new Producer();

    await expect(producer.createChannel()).rejects.toThrowError(
      "Failed to establish RabbitMQ connection"
    );

    // Verify that amqp.connect was called
    expect(mockConnect).toHaveBeenCalledWith(process.env.AMQP_URL);
  });
});

// Other test cases for message publishing can also be added here
