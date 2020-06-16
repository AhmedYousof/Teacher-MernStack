const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

const crypto = require("crypto");
const nodemailer = require("nodemailer");
const validateLoginInput = require("../validation/login");
const validateProfileInput = require("../validation/profile");

//@Route POST localhost:3000/login
//@DESC Login all users (Students & Teacher)
//@Parmeters(email, password)
router.post("/login", (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);
  const { email, password } = req.body;

  if (!isValid) {
    return res.status(400).json(errors);
  }

  Teacher.findOne({ email }).then((teacher) => {
    Student.findOne({ email }).then((student) => {
      Admin.findOne({ email }).then((admin) => {
        if (!teacher && !student && !admin) {
          errors.email = "User not Found";
          return res.status(404).json(errors);
        }
        if (teacher) {
          user = teacher;
        }
        if (student) {
          user = student;
        }
        if (admin) {
          user = admin;
        }

        bcrypt.compare(password, user.password).then((isMatch) => {
          if (isMatch) {
            const payload = {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              role: user.role,
            };
            jwt.sign(payload, "secret", { expiresIn: 3600 }, (err, token) => {
              res.json({ Success: true, token: "Bearer " + token });
            });
          } else {
            errors.password = "Password Incorrect";
            return res.status(400).json(errors);
          }
        });
      });
    });
  });
});

//@Route POST localhost:3000/reset-password
//@Desc RESET PASSWORD
//@Parmeters(email)
//@status Still UNCOMPLETE

router.post("/reset-password", (req, res, next) => {
  const { email } = req.body;
  Teacher.findOne({ email }).then((teacher) => {
    Student.findOne({ email }).then((student) => {
      if (!teacher && !student) {
        return res.status(404).json("User is not exist");
      }

      if (teacher) {
        user = teacher;
      }
      if (student) {
        user = student;
      }

      token = crypto.randomBytes(32).toString("hex"); //creating the token to be sent to the forgot password form (react)
      user.update({
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 3600000,
      });
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: `${process.env.EMAIL_ADDRESS}`,
          pass: `${process.env.EMAIL_PASSWORD}`,
        },
      });
      const mailOptions = {
        from: "TeacharEG@gmail.com",
        to: `${user.email}`,
        subject: "Link to reset password",
        text: `https:localhost:3000/reset-password/${token}`,
      };
      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          res.status(400).json("Erorr " + err);
        } else {
          res.status(200).json("Recovery email sent");
        }
      });
    });
  });
});

router.get(
  "/dashboard",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Teacher.findOne({ _id: user.id }).then((teacher) => {
      Student.findOne({ _id: req.user.id }).then((student) => {
        Admin.findOne({ _id: req.user.id }).then((admin) => {
          if (teacher) {
            user = teacher;
          }
          if (student) {
            user = student;
          }
          if (admin) {
            user = admin;
          }
          if (!user) {
            return res.status(404).json("user not found");
          } else {
            res.json(user);
          }
        });
      });
    });
  }
);

router.get(
  "/profile/:profile_id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Student.findById(req.params.profile_id).then((student) => {
      Teacher.findById(req.params.profile_id).then((teacher) => {
        if (student) {
          user = student;
        }
        if (teacher) {
          user = teacher;
        }
        if (!user) {
          return res.status(404).json("user not found");
        } else {
          res.json(user);
        }
      });
    });
  }
);

router.post(
  "/edit-profile",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Teacher.findOne({ _id: req.user._id }, (err, teacher) => {
      Student.findOne({ _id: req.user._id }, (err, student) => {
        const { errors, isValid } = validateProfileInput(req.body);

        if (!isValid) {
          return res.status(400).json(errors);
        }
        if (student) {
          user = student;
        }
        if (teacher) {
          user = teacher;
        }
        if (err) return next(err);
        if (req.body.name) user.name = req.body.name;
        if (req.body.address) user.address = req.body.address;
        //if (req.body.courses) user.courses = req.body.courses;
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.city) user.city = req.body.city;
        if (req.body.course) user.course = req.body.course;
        if (req.body.sallary) user.sallary = req.body.sallary;
        if (req.body.bio) user.bio = req.body.bio;
        if (req.body.youtube) user.social.youtube = req.body.youtube;
        if (req.body.twitter) user.social.twitter = req.body.twitter;
        if (req.body.facebook) user.social.facebook = req.body.facebook;
        if (req.body.linkedin) user.social.linkedin = req.body.linkedin;

        user
          .save()
          .then((user) => res.json(user))
          .catch((err) => console.log(err));
      });
    });
  }
);

router.post(
  "/join-request/:profile_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Student.findOne({ _id: user.id }).then((student) => {
      Teacher.findById(req.params.profile_id).then((teacher) => {
        if (
          teacher.waitings.filter(
            (waiting) => waiting.user.toString() === user.id
          ).length > 0 ||
          teacher.courses.filter(
            (course) => course.courseId.toString() === user.id
          ).length > 0
        ) {
          return res.status(400).json({ Enrolled: "Enrolled" });
        } else {
          //student
          const newStudent = {
            user: student._id,
            name: student.name,
            course: teacher.course,
            date: new Date()
              .toISOString()
              .replace(/T/, " ") // replace T with a space
              .replace(/\..+/, ""),
          };
          const newTeacher = {
            user: teacher._id,
            name: teacher.name,
            course: teacher.course,
            date: new Date()
              .toISOString()
              .replace(/T/, " ") // replace T with a space
              .replace(/\..+/, ""),
          };

          student.waitings.unshift(newTeacher);
          student.save().then((res) => res.json(res));

          //teacher
          teacher.waitings.unshift(newStudent);
          teacher.save().then((user) => res.json(user));
        }
      });
    });
  }
);
router.post(
  "/join-course/:student_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Teacher.findOne({ _id: user.id }).then((teacher) => {
      Student.findById(req.params.student_id).then((student) => {
        if (
          teacher.courses.filter(
            (course) => course.courseId.toString() === student._id
          ).length > 0
        ) {
          return res.status(400).json({ error: "error" });
        }
        //student
        const newStudent = {
          courseId: student._id,
          name: student.name,
          course: teacher.course,
          address: student.city,
          sallary: teacher.sallary,
          date: new Date()
            .toISOString()
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, ""),
        };
        const newTeacher = {
          courseId: teacher._id,
          name: teacher.name,
          course: teacher.course,
          address: teacher.city,
          sallary: teacher.sallary,
          date: new Date()
            .toISOString()
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, ""),
        };

        student.courses.push(newTeacher);
        //if(student.waitings.user === student._id){}
        const removeStudentIndex = student.waitings
          .map((item) => item.user)
          .indexOf(req.params.student_id);
        student.waitings.splice(removeStudentIndex, 1);
        student.save().then((user) => res.json(user));

        //teacher
        teacher.courses.push(newStudent);
        const removeIndex = teacher.waitings
          .map((item) => item.user)
          .indexOf(req.params.student_id);
        teacher.waitings.splice(removeIndex, 1);
        teacher.save().then((user) => res.json(user));
      });
    });
  }
);
router.post(
  "/refuse-course/:student_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Teacher.findOne({ _id: user.id }).then((teacher) => {
      Student.findById(req.params.student_id).then((student) => {
        const removeStudentIndex = student.waitings
          .map((item) => item.user)
          .indexOf(req.params.student_id);
        student.waitings.splice(removeStudentIndex, 1);
        const removeIndex = teacher.waitings
          .map((item) => item.user)
          .indexOf(req.params.student_id);
        student.save().then((user) => res.json(user));
        teacher.waitings.splice(removeIndex, 1);
        teacher.save().then((user) => res.json(user));
      });
    });
  }
);

router.post(
  "/remove-course/:course_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Admin.findOne({ _id: user.id }).then((admin) => {
      if (!admin) {
        Teacher.findOne({ _id: user.id }).then((teacher) => {
          Student.findOne({ _id: user.id }).then((student) => {
            Student.findById(req.params.course_id).then((tCourse) => {
              Teacher.findById(req.params.course_id).then((sCourse) => {
                let target;
                if (tCourse) {
                  target = tCourse;
                }
                if (sCourse) {
                  target = sCourse;
                }
                if (teacher) {
                  user = teacher;
                }
                if (student) {
                  user = student;
                }

                const removeTargetIndex = target.courses
                  .map((item) => item.courseId)
                  .indexOf(req.params.course_id);
                target.courses.splice(removeTargetIndex, 1);
                const removeIndex = user.courses
                  .map((item) => item._id)
                  .indexOf(req.params.course_id);
                target.save().then((user) => res.json(user));
                user.courses.splice(removeIndex, 1);
                user.save().then((user) => res.json(user));
              });
            });
          });
        });
      }
    });
  }
);

module.exports = router;
