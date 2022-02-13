const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://Amit:Amit1122@cluster0.w8ehl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
