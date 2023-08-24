const request = require('supertest');
const app = require('../../app'); // Import your Express app instance
const BankModel = require('../../models/bankSchema'); // Import your BankModel
const helper = require('../../utils/bankHelperFunction'); // Import your helper functions
const { v4: uuidv4 } = require('uuid');
const Producer = require("../../producer");

const axios=require("axios")
const producer = new Producer(); // Import your RabbitMQ producer module
const mongoose = require('mongoose'); // Import mongoose
const amqp = require("amqplib");

const bankHelperFunction = require('../../models/bankSchema'); // Import your helper functions



const {
    areAllFieldsFilled,
    removeUnderScoreIds,
    updateBankresponse,
    updateAllBankresponse,
    checkBankExists,
    deleteFromDataBase,
  } = require('../../utils/bankHelperFunction');
  describe("Helper Functions", () => {
    describe("updateAllBankresponse", () => {
      it("should update all bank responses by removing underscore IDs", () => {
        const mockBanks = [
          {
            _id: "someId",
            name: "Example Bank",
            abbreviation: "EB",
          },
          {
            _id: "anotherId",
            name: "Test Bank",
            abbreviation: "TB",
          },
        ];
  
        const updatedResponse = updateAllBankresponse(mockBanks);
  
        expect(updatedResponse).toEqual([
          {
            name: "Example Bank",
            abbreviation: "EB",
          },
          {
            name: "Test Bank",
            abbreviation: "TB",
          },
        ]);
      });
    });
  
    describe("checkBankExists", () => {
      it("should return the input if BankData is not null", () => {
        const mockBankData = {
          name: "Example Bank",
          abbreviation: "EB",
        };
  
        const result = checkBankExists(mockBankData);
  
        expect(result).toEqual(mockBankData);
      });
  
      it("should return null if BankData is null", () => {
        const result = checkBankExists(null);
  
        expect(result).toBeNull();
      });
    });
  
    
  });
  describe('Bank Helper Functions', () => {
    describe('areAllFieldsFilled', () => {
      it('should throw an error if any required field is missing', () => {
        const incompleteBankData = {
          name: 'Example Bank',
          abbreviation: 'EB',
        
        };
  
        expect(() => areAllFieldsFilled(incompleteBankData)).toThrowError('All fields must be filled');
      });
  
      it('should return null if all required fields are filled', () => {
        const completeBankData = {
          name: 'Example Bank',
          abbreviation: 'EB',
          swiftCode: 'EXBKUS33',
          countryName: 'United States',
        };
  
        const result = areAllFieldsFilled(completeBankData);
        expect(result).toBeNull();
      });
    });
  
    describe('removeUnderScoreIds', () => {
      it('should remove _id and __v fields from object', () => {
        const input = {
          _id: 'someId',
          name: 'Example Bank',
          abbreviation: 'EB',
          __v: 1,
        };
  
        const result = JSON.parse(JSON.stringify(input, removeUnderScoreIds));
        expect(result).toEqual({
          name: 'Example Bank',
          abbreviation: 'EB',
        });
      });
    });
  
    describe('updateBankresponse', () => {
      it('should return null if input is null', () => {
        const result = updateBankresponse(null);
        expect(result).toBeNull();
      });
  
      it('should remove _id and __v fields from object', () => {
        const input = {
          _id: 'someId',
          name: 'Example Bank',
          abbreviation: 'EB',
          __v: 1,
        };
  
        const result = updateBankresponse(input);
        expect(result).toEqual({
          name: 'Example Bank',
          abbreviation: 'EB',
        });
      });
    });
 
  });
  
describe("RegisterBank API", () => {
    setTimeout(()=>{
      
        let mockConnect;
        let mockCreateChannel;
      
        beforeAll(() => {
     
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
          mockConnect.mockRejectedValue(
            new Error("Failed to establish RabbitMQ connection")
          );
          const producer = new Producer();
          await expect(producer.createChannel()).rejects.toThrowError(
            "Failed to establish RabbitMQ connection"
          );
          // Verify that amqp.connect was called
          expect(mockConnect).toHaveBeenCalledWith(process.env.AMQP_URL);
        });
      
        it("should register a bank", async () => {
            // Mock the BankModel's save method to return some mock data
            BankModel.prototype.save = jest
              .fn()
              .mockResolvedValue({
                submittedBy: "john.doe@example.com",
                name: "Example Bank",
                abbreviation: "EB",
                description: "A sample bank for testing purposes",
                swiftCode: "EXBKUS33",
                countryName: "United States",
              });
            // Mock the helper's updateBankresponse method
            helper.updateBankresponse = jest
              .fn()
              .mockReturnValue({
                submittedBy: "john.doe@example.com",
                name: "Example Bank",
                abbreviation: "EB",
                description: "A sample bank for testing purposes",
                swiftCode: "EXBKUS33",
                countryName: "United States",
              });
            const mockBankData = {
              submittedBy: "john.doe@example.com",
              name: "Example Bank",
              abbreviation: "EB",
              description: "A sample bank for testing purposes",
              swiftCode: "EXBKUS33",
              countryName: "United States",
            };
          
            const response = await request(app).post("/banks").send(mockBankData);
            expect(response.status).toBe(201);
            expect(
              response.body
            ).toEqual(/* Expected response body based on mock data */);
            expect(BankModel.prototype.save).toHaveBeenCalledWith(mockBankData);
            expect(
              helper.updateBankresponse
            ).toHaveBeenCalledWith(/* Arguments based on mock data */);
          });
    },10000)
});

describe('GetAllBanks API', () => {
  it('should return a list of banks', async () => {

    const mockBanks = [
  
        {
            submittedBy: "john.doe@example.com",
            name: "Example Bank",
            abbreviation: "EB",
            description: "A sample bank for testing purposes",
            swiftCode: "EXBKUS33",
            countryName: "United States",
          },
          {
            submittedBy: "jane.smith@example.com",
            name: "Test Bank",
            abbreviation: "TB",
            description: "A test bank with some data",
            swiftCode: "TSTBANK1",
            countryName: "Canada",
          },
    ];

    
    BankModel.find = jest.fn().mockResolvedValue(mockBanks);

 
    helper.checkBankExists = jest.fn().mockReturnValue(true);
    helper.updateAllBankresponse = jest.fn().mockReturnValue(mockBanks);


    const response = await request(app).get('/banks'); 

   
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.BanksLength).toBe(mockBanks.length);
    expect(response.body.updatedResponse).toEqual(mockBanks);

    expect(BankModel.find).toHaveBeenCalled();
    expect(helper.checkBankExists).toHaveBeenCalled();
    expect(helper.updateAllBankresponse).toHaveBeenCalled();
  });

  it('should handle the case when no banks are registered', async () => {

    helper.checkBankExists = jest.fn().mockReturnValue(false);
  
    const response = await request(app).get('/banks'); 
  
    // Assertions
    expect(response.status).toBe(204);

    expect(helper.checkBankExists).toHaveBeenCalled();
  });
  
  it('should handle errors', async () => {
  
    BankModel.find = jest.fn().mockRejectedValue(new Error('Database error'));

   
    const response = await request(app).get('/banks');

    expect(response.status).toBe(500);
    

    
    expect(BankModel.find).toHaveBeenCalled();
  });
});

describe('GetBanksByUuid API', () => {
    it('should get bank data by UUID', async () => {
      const mockUuid = '55610f03-37bc-4383-92ca-8fd2a408e93a'; // Use the actual UUID
  
      const mockBankData = {
        uuid: mockUuid,
        // other properties...
      };
  
      BankModel.findOne = jest.fn().mockResolvedValue(mockBankData);
      helper.checkBankExists = jest.fn().mockReturnValue(true);
      helper.updateBankresponse = jest.fn().mockReturnValue(mockBankData);
  
      const response = await request(app).get(`/banks/${mockUuid}`); // Use the correct UUID
  
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.updatedResponse).toEqual(mockBankData);
  
      expect(BankModel.findOne).toHaveBeenCalledWith({ uuid: mockUuid });
      expect(helper.checkBankExists).toHaveBeenCalledWith(mockBankData);
      expect(helper.updateBankresponse).toHaveBeenCalledWith(mockBankData);
    });
  
    it('should handle the case when bank is not found', async () => {
      const mockUuid = '55610f03-37bc-4383-92ca-8fd2a408e93b';
  
      BankModel.findOne = jest.fn().mockResolvedValue(null);
      helper.checkBankExists = jest.fn().mockReturnValue(false);
  
      const response = await request(app).get(`/banks/${mockUuid}`); // Use the correct UUID
  
      expect(response.status).toBe(204);
      
  
      expect(BankModel.findOne).toHaveBeenCalledWith({ uuid: mockUuid });
      expect(helper.checkBankExists).toHaveBeenCalledWith(null);
    });
    it('should handle error non uid', async () => {
        const mockUuid = "55610f03-37bc-4383-92ca-8fd2a408e9ff3a"; // Use the correct UUID format
    
        const response = await request(app).get(`/banks/${mockUuid}`);
    
        // Expected: Response status should be 400
        expect(response.status).toBe(400);
        

       
    });
    
 
    it('should handle errors', async () => {
      const mockUuid = '55610f03-37bc-4383-92ca-8fd2a408e93a';
  
      BankModel.findOne = jest.fn().mockRejectedValue(new Error('Database error'));
  
      const response = await request(app).get(`/banks/${mockUuid}`); 
  
      expect(response.status).toBe(500);
  
      
    });
  });
  
  describe('DeleteBankByUuid API', () => {
    it('should delete a bank by UUID', async () => {
      const mockUuid = '55610f03-37bc-4383-92ca-8fd2a408e93a';
      
      // Mock the BankModel's findOneAndDelete method
      BankModel.findOneAndDelete = jest.fn().mockResolvedValue({ /* Return some mock data here */ });
      
      const response = await request(app).delete(`/banks/${mockUuid}`);
  
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
     
  
      expect(BankModel.findOneAndDelete).toHaveBeenCalledWith({ uuid: mockUuid });
    });
  
    it('should handle the case when bank is not found', async () => {
      const mockUuid = '55610f03-37bc-4383-92ca-8fd2a408e93a';
  
      // Mock the BankModel's findOneAndDelete method to return null
      BankModel.findOneAndDelete = jest.fn().mockResolvedValue(null);
  
      const response = await request(app).delete(`/banks/${mockUuid}`);
  
      expect(response.status).toBe(404);
      expect(response.body.error).toBe(`Bank not found with id ${mockUuid}`);
  
      expect(BankModel.findOneAndDelete).toHaveBeenCalledWith({ uuid: mockUuid });
    });
  
    it('should handle errors', async () => {
      const mockUuid = '55610f03-37bc-4383-92ca-8fd2a408e93a';
  
      // Mock the BankModel's findOneAndDelete method to throw an error
      BankModel.findOneAndDelete = jest.fn().mockRejectedValue(new Error('Database error'));
  
      const response = await request(app).delete(`/banks/${mockUuid}`);
  
      expect(response.status).toBe(500);
  
      expect(BankModel.findOneAndDelete).toHaveBeenCalledWith({ uuid: mockUuid });
    });
  });

  describe('UpdateBankByUuid API', () => {
    it('should update a bank by UUID', async () => {
      const mockUuid = '55610f03-37bc-4383-92ca-8fd2a408e93a';
      const mockUpdateFields = {
        name: 'Updated Bank Name',
        abbreviation: 'UBN',
      };
      
      // Mock the BankModel's updateOne method
      BankModel.updateOne = jest.fn().mockResolvedValue({ /* Return some mock data here */ });
      
      const response = await request(app)
        .patch(`/banks/${mockUuid}`)
        .send(mockUpdateFields);
  
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.UpdateBankDetails).toEqual(expect.any(Object));
  
      expect(BankModel.updateOne).toHaveBeenCalledWith(
        { uuid: mockUuid },
        { $set: mockUpdateFields }
      );
    });
  
    it('should handle errors', async () => {
      const mockUuid = '55610f03-37bc-4383-92ca-8fd2a408e93a';
      const mockUpdateFields = {
        name: 'Updated Bank Name',
        abbreviation: 'UBN',
      };
  
      // Mock the BankModel's updateOne method to throw an error
      BankModel.updateOne = jest.fn().mockRejectedValue(new Error('Database error'));
  
      const response = await request(app)
        .patch(`/banks/${mockUuid}`)
        .send(mockUpdateFields);
  
      expect(response.status).toBe(500);
  
      expect(BankModel.updateOne).toHaveBeenCalledWith(
        { uuid: mockUuid },
        { $set: mockUpdateFields }
      );
    });
  });

