import mongoose from 'mongoose';

const fareSchema = new mongoose.Schema({
    ride_id: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true
    },
    passenger_id: {
      type: String,
      required: true
    },
    driver_id: {
      type: String,
      required: true
    },
    basePrice: {
      type: Number,
      required: true
    },
    surgeMultiplier: {
      type: Number,
      default: 1.0
    },
    finalPrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'BDT'
    },
    timestamp: {
      type: Number,
      default: () => Date.now()
    }
  });
  
  export const Fare = mongoose.model('Fare', fareSchema);