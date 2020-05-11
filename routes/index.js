const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const validateLoginInput = require("../validation/login");

//@Route POST localhost:3000/login
//@DESC Login all users (Students & Teacher)
//@Parmeters(email, password)
router.post("/login", (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);
  const { email, password } = req.body;

  if (!isValid) {
    return res.status(400).json(errors);
  }

  Teacher.findOne({ email }).then(teacher => {
    Student.findOne({ email }).then(student => {
      if (!teacher && !student) {
        errors.email = "User not Found";
        return res.status(404).json(errors);
      }
      if (teacher) {
        user = teacher;
      }
      if (student) {
        user = student;
      }
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            role: user.role
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

//@Route POST localhost:3000/reset-password
//@Desc RESET PASSWORD
//@Parmeters(email)
//@status Still UNCOMPLETE

router.post("/reset-password", (req, res, next) => {
  const { email } = req.body;
  Teacher.findOne({ email }).then(teacher => {
    Student.findOne({ email }).then(student => {
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
        resetPasswordExpires: Date.now() + 3600000
      });
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: `${process.env.EMAIL_ADDRESS}`,
          pass: `${process.env.EMAIL_PASSWORD}`
        }
      });
      const mailOptions = {
        from: "TeacharEG@gmail.com",
        to: `${user.email}`,
        subject: "Link to reset password",
        text: `https:localhost:3000/reset-password/${token}`
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
    Teacher.findOne({ _id: user.id }).then(teacher => {
      Student.findOne({ _id: req.user.id }).then(student => {
        if (teacher) {
          user = teacher;
        }
        if (student) {
          user = student;
        }
        res.json(user);
      });
    });
  }
);

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

router.post(
  "/join-request/:profile_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Student.findOne({ _id: user.id }).then(student => {
      Teacher.findById(req.params.profile_id).then(teacher => {
        if (
          teacher.waitings.filter(
            waiting => waiting.user.toString() === user.id
          ).length > 0 ||
          teacher.courses.filter(
            course => course.courseId.toString() === user.id
          ).length > 0
        ) {
          return res.status(400).json({ Enrolled: "Enrolled" });
        }
        //student
        const newStudent = {
          user: student._id,
          name: student.name,
          course: teacher.course,
          date: new Date()
            .toISOString()
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "")
        };
        const newTeacher = {
          user: teacher._id,
          name: teacher.name,
          course: teacher.course,
          date: new Date()
            .toISOString()
            .replace(/T/, " ") // replace T with a space
            .replace(/\..+/, "")
        };

        student.waitings.unshift(newTeacher);
        student.save().then(res => res.json(res));

        //teacher
        teacher.waitings.unshift(newStudent);
        teacher.save().then(user => res.json(user));
      });
    });
  }
);
router.post(
  "/join-course/:student_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Teacher.findOne({ _id: user.id }).then(teacher => {
      Student.findById(req.params.student_id).then(student => {
        if (
          teacher.courses.filter(
            course => course.courseId.toString() === student._id
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
            .replace(/\..+/, "")
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
            .replace(/\..+/, "")
        };

        student.courses.push(newTeacher);
        //if(student.waitings.user === student._id){}
        const removeStudentIndex = student.waitings
          .map(item => item.user)
          .indexOf(req.params.student_id);
        student.waitings.splice(removeStudentIndex, 1);
        student.save().then(user => res.json(user));

        //teacher
        teacher.courses.push(newStudent);
        const removeIndex = teacher.waitings
          .map(item => item.id)
          .indexOf(req.params.student_id);
        teacher.waitings.splice(removeIndex, 1);
        teacher.save().then(user => res.json(user));
      });
    });
  }
);
router.post(
  "/refuse-course/:student_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Teacher.findOne({ _id: user.id }).then(teacher => {
      Student.findById(req.params.student_id).then(student => {
        const removeStudentIndex = student.waitings
          .map(item => item.user)
          .indexOf(req.params.student_id);
        student.waitings.splice(removeStudentIndex, 1);
        const removeIndex = teacher.waitings
          .map(item => item.id)
          .indexOf(req.params.student_id);
        student.save().then(user => res.json(user));
        teacher.waitings.splice(removeIndex, 1);
        teacher.save().then(user => res.json(user));
      });
    });
  }
);

module.exports = router;
