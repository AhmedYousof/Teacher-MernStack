const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Course = require("../models/Course");
const jwt = require("jsonwebtoken");
const passport = require("passport");

// validations
const validateTeacherRegisterInput = require("../validation/register");
const validateProfileInput = require("../validation/profile");

//@ROUTE POST localhost:3000/teachers/register
//@DESC Teacher register
//@Parmeters(name, email, password, confirmpassword)
router.post("/register", (req, res, next) => {
  const { errors, isValid } = validateTeacherRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Teacher.findOne({ email: req.body.email }).then((teacher) => {
    Student.findOne({ email: req.body.email }).then((user) => {
      errors.email = "Email Already exists";
      if (user || teacher) {
        return res.status(400).json(errors);
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: "200",
          r: "pg",
          d: "mm",
        });
        const newUser = new Teacher({
          name: req.body.name,
          email: req.body.email,
          address: req.body.address,
          phone: req.body.phone,
          password: req.body.password,
          confirmpassword: req.body.confirmpassword,
          city: req.body.city,
          course: req.body.course,
          sallary: req.body.sallary,
          avatar,
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            bcrypt.compare(newUser.confirmpassword, hash).then((isMatch) => {
              if (isMatch) {
                newUser
                  .save()
                  .then((user) => res.json(user))
                  .catch((err) => console.log(err));
              } else {
                return res.status(400).json("Confirm Password isn't correct ");
              }
            });
          });
        });
      }
    });
  });
});

//@Route GET localhost:5000/profile
//@Desc GET USER PROFILE
router.get(
  "/profiles",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Teacher.find()
      .then((profiles) => {
        if (!profiles) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }

        res.json(profiles);
      })
      .catch((err) => res.status(404).json(err));
  }
);

//@Route GET localhost:3000/teachers
//@DESC Get all teachers
router.get("/", (req, res, next) => {
  const errors = {};
  Teacher.find({})
    .then((teachers) => {
      if (!teachers) {
        errors.noteachers = "there are no teachers";
        return res.status(404).json(errors);
      }
      res.json(teachers);
    })
    .catch((err) => {
      res.status(404).json({ teachers: "There are no teachers" });
    });
});
//@Route GET localhost:3000/teachers
//@DESC Get all teachers
router.get("/teacher/:teacher_id", (req, res) => {
  const errors = {};
  Teacher.findOne({ _id: req.params.teacher_id })
    .then((teacher) => {
      if (!teacher) {
        errors.noteachers = "there are no teacher";
        return res.status(404).json(errors);
      }
      res.json(teacher);
    })
    .catch((err) => {
      res.status(404).json({ teachers: "There are no teacher" });
    });
});
module.exports = router;
