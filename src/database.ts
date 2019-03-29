import * as mongoose from 'mongoose';

export async function connect () {
  return mongoose.connect(process.env.MONGODB_URI!, {
    useCreateIndex: true,
    useNewUrlParser: true
  })
};

export async function close () {
  return mongoose.connection && mongoose.connection.close()
};
