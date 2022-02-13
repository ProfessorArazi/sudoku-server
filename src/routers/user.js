const express = require("express");
const router = new express.Router();
const User = require("../Models/user");

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
  const user = await User.findById(req.body.userScore.userId);
  try {
    await user.scores.push(req.body.userScore);
    await user.save();
    if (topScores.length < 10) {
      let scores = await User.find({}, "scores -_id");

      topScores = scores
        .map((x) => x.scores)
        .flat(Infinity)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((x) => {
          return {
            ...x._doc,
            userGame: x.userId === req.body.userScore.userId ? true : false,
          };
        });
    } else if (req.body.userScore.score > topScores[9]) {
      topScores.pop();
      topScores.push(req.body.userScore);
      topScores
        .sort((a, b) => b.score - a.score)
        .map((x) => {
          return {
            ...x,
            userGame: x.userId === req.body.userScore.userId ? true : false,
          };
        });
    }
    console.log(topScores);
    res.status(200).send(topScores);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
