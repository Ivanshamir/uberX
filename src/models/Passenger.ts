import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
    firstName: { 
      type: String, 
      required: true,
      trim: true
    },
    lastName: { 
      type: String, 
      required: true,
      trim: true
    },
    email: { 
      type: String, 
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: { 
      type: String, 
      required: true,
      trim: true
    },
    identificationType: { 
      type: String,
      required: false,
      default: null
    },
    identificationNumber: { 
      type: String, 
      required: false, // Made optional
      trim: true,
      default: null
    },
    identificationDocuments: [{ 
      type: String,
      default: []
    }],
    presentAddress: { 
      type: String, 
      required: false, // Made optional
      trim: true,
      default: null
    },
    permanentAddress: { 
      type: String, 
      required: false, // Made optional
      trim: true,
      default: null
    },
    status: { 
      type: String,
    },
    rating: { 
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    referenceId: { 
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    createdAt: { 
      type: Number,
      default: () => Date.now()
    },
    updatedAt: { 
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

export const Passenger = mongoose.model('Passenger', passengerSchema);