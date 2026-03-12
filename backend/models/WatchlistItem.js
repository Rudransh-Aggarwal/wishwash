const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mediaId: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['anime', 'movie', 'tv'],
    required: true
  },
  title: String,
  image: String,
  score: Number,
  episodes: Number,
  status: {
    type: String,
    enum: ['watching', 'on-hold', 'plan-to-watch', 'dropped', 'completed'],
    default: 'plan-to-watch'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index to prevent duplicates
watchlistItemSchema.index({ user: 1, mediaId: 1, mediaType: 1 }, { unique: true });

module.exports = mongoose.model('WatchlistItem', watchlistItemSchema);
