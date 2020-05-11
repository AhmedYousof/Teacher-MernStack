const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const jwt = require("jsonwebtoken");
const passport = require("passport");

// validations
const validateRegisterInput = require("../validation/register");
const validateProfileInput = require("../validation/profile");

//@Route POST localhost:3000/students/register
//@DESC Student register
//@Parmeters(name, email, password, confirmpassword)

router.post("/register", (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Teacher.findOne({ email: req.body.email }).then(teacher => {
    Student.findOne({ email: req.body.email }).then(user => {
      errors.email = "Email Already exists";
      if (user || teacher) {
        return res.status(400).json(errors);
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: "200",
          r: "pg",
          d: "mm"
        });
        const newUser = new Student({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          confirmpassword: req.body.confirmpassword,
          city: req.body.city,
          address: req.body.address,
          phone: req.body.phone,
          avatar
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            bcrypt.compare(newUser.confirmpassword, hash).then(isMatch => {
              if (isMatch) {
                newUser
                  .save()
                  .then(user => res.json(user))
                  .catch(err => console.log(err));
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

//@Route POST localhost:3000/student/edit-profile
//@DESC Edit student profile
router.post(
  "/edit-profile",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    Teacher.findOne({ _id: req.user._id }, (err, user) => {
      if (err) return next(err);
      if (req.body.name) user.profile.name = req.body.name;
      if (req.body.address) user.address = req.body.address;
      //if (req.body.courses) user.courses = req.body.courses;
      if (req.body.phone) user.phone = req.body.phone;
      if (req.body.bio) user.bio = req.body.bio;

      user
        .save()
        .then(user => res.json(user))
        .catch(err => console.log(err));
    });
  }
);

//@Route GET localhost:3000/students/profile
//@DESC Student profile
/*router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Student.findOne({ _id: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);*/

//@Route GET localhost:3000/students
//@DESC Get all students
router.get("/", (req, res, next) => {
  const errors = {};
  Student.find({})
    .then(students => {
      if (!students) {
        errors.nostudents = "there are no students";
        return res.status(404).json(errors);
      }
      res.json(students);
    })
    .catch(err => {
      res.status(404).json({ students: "There are no students" });
    });
});
router.post(
  "/course-join",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Student.findOne({ _id: req.user._id }).then(student => {
      student.courses.push({
        teacher: req.body.teacher_id,
        name: req.body.teacher_name,
        address: req.body.teacher_address,
        price: req.body.teacher_sallary,
        course: req.body.course_name
        //date: dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")
      });
      student
        .save()
        .then(user => res.json(user))
        .catch(err => res.status(400).json(err));
    });
  }
);
router.get(
  "/course-list",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Student.findOne({ _id: req.user._id }).then(student => {
      const courses = student.courses;
      res.json(courses);
    });
  }
);
module.exports = router;
