import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['rider', 'driver'], required: true },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);