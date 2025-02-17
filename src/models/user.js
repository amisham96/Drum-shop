import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minLength: [1, 'Full name can\'t be empty'],
    maxLength: [60, 'Full name can\'t exceed 60 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
  },
  phone: {
    type: String,
    requried: [true, 'Phone number is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  privilege: {
    type: String,
    enum: ['customer', 'staff', 'admin', 'chief'],
    default: 'customer',
  },
});

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

// pre-save hook to encrypt password before saving the user
userSchema.pre('save', async function(next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.method('isValidPassword', async function(password) {
  // compare the password stored with the hashed password stored
  const passwordMatch = await bcrypt.compare(password, this.password);
  return passwordMatch;
});

const User = mongoose.models.users || mongoose.model('users', userSchema);

export default User;