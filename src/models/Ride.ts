import mongoose from 'mongoose';


const rideSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      user_id: { 
        type: String, 
        required: true,
        unique: false,
        lowercase: true,
        trim: true,
      },
      source: {
        type: String, 
        required: true,
        unique: false,
        lowercase: true,
        trim: true
      },
      destination: {
        type: String, 
        required: true,
        unique: false,
        lowercase: true,
        trim: true
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