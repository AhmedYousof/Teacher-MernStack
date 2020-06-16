const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  role: {
    type: String,
    default: "admin",
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
});

module.exports = Admin = mongoose.model("admin", AdminSchema);
