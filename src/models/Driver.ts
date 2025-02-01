import mongoose, { model } from 'mongoose';

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    brand: { type: String, required: false },
    model: { type: String, required: false },
    reg_number: { type: String, required: true },
    color: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

export const Driver = mongoose.model('Driver', driverSchema);