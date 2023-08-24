const mongoose = require("mongoose");
const connectDatabase=require('../../config/connectWithDataBase')
    describe('Database Connection', () => {
        beforeAll(() => {
          // Mock mongoose.connect to return a resolved promise
          mongoose.connect = jest.fn().mockResolvedValue();
        });
        afterAll(() => {
          // Restore the original mongoose.connect
          mongoose.connect.mockRestore();
        });
        it('should successfully connect to the database', async () => {
          await connectDatabase();
          // Verify that mongoose.connect was called
          expect(mongoose.connect).toHaveBeenCalled();
        });
        it('should handle connection errors appropriately', async () => {
          // Mock mongoose.connect to return a rejected promise
          mongoose.connect.mockRejectedValue(new Error('Connection error'));
          await connectDatabase();
          // Verify that mongoose.connect was called
          expect(mongoose.connect).toHaveBeenCalled();
        });
});