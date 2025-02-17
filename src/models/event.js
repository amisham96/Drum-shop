import mongoose from 'mongoose';
import Product from './product';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Event name can\'t be empty'],
    minLength: [1, 'Event name can\'t be empty'],
    maxLength: [150, 'Event name can\'t exceed 150 characters'],
  },
  location: {
    type: String,
    trim: true,
    required: [true, 'Event location can\'t be empty'],
    minLength: [1, 'Event location can\'t be empty'],
    maxLength: [300, 'Event location can\'t exceed 300 characters'],
  },
  date: {
    type: Date,
    required: [true, 'Event date can\'t be empty']
  },
  time: {
    type: String,
    required: [true, 'Event time can\'t be empty'],
    validate: {
      validator: function(val){
        return /^([01]\d|2[0-3]):?([0-5]\d)$/.test(val);
      },
      message: 'Invalid event time format. Please use HH:MM format'
    }
  },
  details: {
    type: String,
    trim: true,
    required: [true, 'Event details can\'t be empty'],
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    youtube: String,
    x: String,
  },

  featuredArtists: [{
    name: {
      type: String,
      required: [true, 'Artist name is required'],
      minLength: [1, 'Artist name can\'t be empty']
    },
    title: String,
    link: String,
  }],
  featuredProducts: [{
    type: mongoose.Types.ObjectId,
    ref: Product.modelName
  }],

  poster: {
    type: String,
    minLength: [1, 'Event poster can\'t be empty'],
  },
  media: [String],

  socialLinks: {
    instagram: String,
    facebook: String,
    youtube: String,
    x: String,
  },

  status: {
    type: String,
    enum: ['ongoing', 'highlights'],
  },
}, {
  timstamps: true
});

const Event = mongoose.models.events || mongoose.model('events', eventSchema);

export default Event;