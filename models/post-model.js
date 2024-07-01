const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./user-model');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A post must have a title'],
    },
    images: Array,
    price: {
      type: Number,
      required: [true, 'A post must have a price'],
    },
    address: {
      type: String,
      required: [true, 'A post must have an address'],
    },
    province: String,
    district: String,
    ward: String,
    description: {
      type: String,
      required: [true, 'A post must have the description'],
    },
    category: {
      type: String,
      required: [true, 'A post must be classified'],
      enum: ["pass-do", "cho-thue-tro", "o-ghep"]
    },
    tag: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'disable'],
      default: 'pending',
    },
    createBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    contactPhone: {
      type: String,
      require: [true, 'Missing contactPhone!']
    },
    area: Number,
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
