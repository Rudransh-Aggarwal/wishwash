const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const WatchlistItem = require('../models/WatchlistItem');

// @route   GET /api/watchlist
// @desc    Get user's watchlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (type) query.mediaType = type;

    const items = await WatchlistItem.find(query).sort({ addedAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/watchlist
// @desc    Add to watchlist
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { mediaId, mediaType, title, image, score, episodes, status } = req.body;

    const existing = await WatchlistItem.findOne({ user: req.user._id, mediaId, mediaType });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already in watchlist' });
    }

    const item = await WatchlistItem.create({
      user: req.user._id,
      mediaId, mediaType, title, image, score, episodes,
      status: status || 'plan-to-watch'
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/watchlist/:id
// @desc    Update watchlist item status
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await WatchlistItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: req.body.status },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/watchlist/:id
// @desc    Remove from watchlist
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await WatchlistItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
