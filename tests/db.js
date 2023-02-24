const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server-core');
process.env['MONGOMS_VERSION'] = '6.0.4';

module.exports.connect = async () => {
  const mongod = await MongoMemoryServer.create();
  module.exports._mongod = mongod;

  const uri = mongod.getUri();
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
  };

  await mongoose.connect(uri, options);
};

module.exports.close = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (module.exports._mongod) await module.exports._mongod.stop();
};

module.exports.clear = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany();
  }
};
