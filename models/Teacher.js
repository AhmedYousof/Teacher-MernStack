const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TeacherSchema = new Schema({
  role: {
    type: String,
    default: "teacher"
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  confirmpassword: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ""
  },
  sallary: {
    type: String,
    default: 0
  },
  avatar: {
    type: String
  },
  course: {
    type: String
  },
  city: {
    type: String,
    default: ""
  },
  waitings: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "students"
      },
      name: { type: String, required: true },
      course: { type: String, required: true },
      date: {
        type: Date,
        default: Date.now()
      }
    }
  ],
  courses: [
    {
      courseId: { type: Schema.Types.ObjectId, ref: "students" },
      name: { type: String, required: true },
      course: { type: String, required: true },
      address: { type: String, required: true },
      sallary: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ],
  phone: {
    type: [String]
  },
  bio: {
    type: String,
    default: ""
  },
  social: {
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    youtube: {
      type: String
    },
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    }
  }
});

module.exports = Teacher = mongoose.model("teachers", TeacherSchema);
