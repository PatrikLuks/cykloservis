// Endpoint pro registraci push subscription
const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const { requireAuth } = require('../middleware/auth');

// Uloží nebo aktualizuje push subscription pro uživatele
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }
    await PushSubscription.findOneAndUpdate(
      { userId: req.user._id, endpoint },
      { endpoint, keys, userId: req.user._id },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

module.exports = router;
