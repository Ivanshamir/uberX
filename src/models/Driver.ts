import mongoose, { model } from 'mongoose';

const driverSchema = new mongoose.Schema({
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
      identificationNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },
      identificationType: {
        type: String,
        required: true,
        trim: true
      },
      identificationDocuments: [{
        type: String,
        required: true
      }],
      presentAddress: {
        type: String,
        required: true,
        trim: true
      },
      permanentAddress: {
        type: String,
        required: true,
        trim: true
      },
      trainingStatus: {
        type: String,
        default: 'Pending'
      },
      licenseType: {
        type: String,
        required: true
      },
      vehicleType: {
        type: String,
        required: true
      },
      vehicleFitnessStatus: {
        type: String,
        default: 'Pending'
      },
      status: {
        type: String,
        default: 'Inactive'
      },
      rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      activeStatus: {
        type: Boolean,
        default: false
      },
      licenseDocuments: [{
        type: String,
        required: true
      }],
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

export const Driver = mongoose.model('Driver', driverSchema);