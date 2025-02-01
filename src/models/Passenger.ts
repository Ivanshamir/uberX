import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Passenger = mongoose.model('Passenger', passengerSchema);