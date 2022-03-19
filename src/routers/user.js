const express = require("express");
const router = new express.Router();
const User = require("../Models/user");
const Score = require("../Models/score");

let topScores = [];

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({
      user: {
        id: user.id,
        userName: user.userName,
      },
      token,
    });
  } catch (error) {
    const { email, password, userName } = error.errors;
    res.send({
      emailError: email,
      passwordError: password,
      userNameError: userName,
    });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    res.send({
      user: {
        id: user.id,
        userName: user.userName,
      },
      token,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/finish", async (req, res) => {
  try {
    let removedScoreId;
    if (topScores.length === 0) {
      topScores = await Score.find();
      topScores.sort((a, b) => b.score.score - a.score.score);
    }
    if (req.body.userScore.score > topScores[9].score.score) {
      removedScoreId = topScores[9]._id;
      topScores.pop();
      topScores.push(req.body.userScore);
      topScores.sort((a, b) => b.score - a.score);
    }
    res.status(200).send(topScores);
    if (removedScoreId) {
      await Score.findByIdAndUpdate(removedScoreId, {
        score: req.body.userScore,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
