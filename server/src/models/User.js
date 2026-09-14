import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['farmer', 'provider', 'admin'],
      default: 'farmer',
      required: true
    },
    state: {
      type: String,
      enum: ['Andhra Pradesh', 'Telangana'],
      required: [true, 'State is required']
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    village: {
      type: String,
      required: [true, 'Village is required'],
      trim: true
    },
    upiId: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      latitude: { type: Number, default: 16.3067 },
      longitude: { type: Number, default: 80.4365 }
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
