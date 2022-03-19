const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  score: {
    score: {
      type: Number,
    },
    mistakes: {
      type: Number,
    },
    clues: {
      type: Number,
    },
    time: {
      type: String,
    },
    userName: {
      type: String,
    },
    userId: {
      type: String,
    },
  },
});

const Score = mongoose.model("Score", scoreSchema);

module.exports = Score;
