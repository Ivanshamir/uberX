import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const rideSchema = new mongoose.Schema({
  // id: { 
  //   type: String, 
  //   required: true,
  //   unique: true,
  //   trim: true,
  //   index: true
  // },
  correlation_id: {
    type: String,
    default: uuidv4,
    unique: false,
    // index: true
  },
  passenger_id: { 
    type: String, 
    required: true,
    trim: true,
    // index: true
  },
  start_location_latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
    validate: {
      validator: (value: number) => {
        return !isNaN(value) && value >= -90 && value <= 90;
      },
      message: 'Latitude must be between -90 and 90 degrees'
    }
  },
  start_location_longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
    validate: {
      validator: (value: number) => {
        return !isNaN(value) && value >= -180 && value <= 180;
      },
      message: 'Longitude must be between -180 and 180 degrees'
    }
  },
  end_location_latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
    validate: {
      validator: (value: number) => {
        return !isNaN(value) && value >= -90 && value <= 90;
      },
      message: 'Latitude must be between -90 and 90 degrees'
    }
  },
  end_location_longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
    validate: {
      validator: (value: number) => {
        return !isNaN(value) && value >= -180 && value <= 180;
      },
      message: 'Longitude must be between -180 and 180 degrees'
    }
  },
  destination_address: {
    type: String, 
    required: true,
    trim: true,
    set: (value: string) => value.toLowerCase()
  },
  createdAt: { 
    type: Number,
    default: () => Date.now()
  },
  deletedAt: { 
    type: Number,
    default: null
  }
}, {
  timestamps: {
    currentTime: () => Date.now()
  }
});

export const Ride = mongoose.model('Ride', rideSchema);