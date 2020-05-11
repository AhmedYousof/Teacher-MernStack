const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  role: {
    type: String,
    default: "student"
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
  avatar: {
    type: String
  },
  courses: [
    {
      courseId: { type: Schema.Types.ObjectId, ref: "teachers" },
      name: { type: String, required: true },
      course: { type: String, required: true },
      address: { type: String, required: true },
      sallary: { type: String, required: true },
      date: { type: Date }
    }
  ],
  city: {
    type: String,
    default: ""
  },
  phone: {
    type: [String]
  },
  address: {
    type: String
  },
  bio: {
    type: String
  },
  education: [
    {
      school: {
        type: String
      },
      degree: {
        type: String
      },
      fieldofstudy: {
        type: String
      },
      from: {
        type: Date
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  waitings: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "teachers"
      },
      name: { type: String, required: true },
      course: { type: String, required: true },
      date: {
        type: Date,
        default: Date.now()
      }
    }
  ],
  social: {
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
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

module.exports = User = mongoose.model("students", StudentSchema);
