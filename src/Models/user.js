const mongoose = require("mongoose");
const validator = require("validator");
const zxcvbn = require("zxcvbn");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length === 0) {
        throw new Error("nothing here");
      }
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("email is invalid");
      }
    },
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    trim: true,
    validate(value) {
      if (zxcvbn(value).score < 2) {
        throw new Error("invalid password");
      }
    },
  },
  scores: [
    {
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
  ],
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.methods.generateAuthToken = async function () {
  try {
    if (this.tokens.length > 0) {
      return this.tokens[0];
    }
    const token = jwt.sign(
      { _id: this._id.toString() },
      "ilovesoccerandbasketball",
      { expiresIn: "1h" }
    );
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return this.tokens[0];
  } catch (e) {
    console.log(e);
  }
};

userSchema.statics.findByCredentials = async (email, password) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Unable to login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Unable to login");
    }
    return user;
  } catch (e) {
    return e;
  }
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
