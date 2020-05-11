const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});
module.exports = User = mongoose.model("courses", CourseSchema);
