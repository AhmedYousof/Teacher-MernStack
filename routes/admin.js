const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");
const Course = require("../models/Course");
const validateAdminRegisterInput = require("../validation/admin");

router.post("/register", (req, res, next) => {
  const { errors, isValid } = validateAdminRegisterInput(req.body);

  Admin.findOne({ email: req.body.email }).then((admin) => {
    errors.email = "Email Already exists";
    if (admin) {
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      const newUser = new Admin({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword,
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

//@Route POST localhost:3000/admin/add-course
//@DESC Add new course
router.post("/add-course", (req, res, next) => {
  const newCourse = new Course({
    name: req.body.name,
  });
  newCourse
    .save()
    .then((course) => {
      res.json(course);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.get("/courses", (req, res) => {
  Course.find()
    .then((courses) => {
      if (!courses) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }

      res.json(courses);
    })
    .catch((err) => res.status(404).json(err));
});

router.get(
  "/teachers",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Teacher.find().then((teachers) => {
      if (!teachers) {
        return res.status(404).json(errors);
      }
      res.json(teachers);
    });
  }
);

router.get(
  "/students",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Student.find().then((students) => {
      if (!students) {
        return res.status(404).json(errors);
      }
      res.json(students);
    });
  }
);

router.post(
  "/remove-student/:student_id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Admin.findOne({ _id: req.user.id }).then((admin) => {
      if (admin) {
        Student.findByIdAndDelete(req.params.student_id).then(
          (err, student) => {
            if (err) return next(err);
            // res.json(student);
          }
        );
      }
    });
    Teacher.find().then((teachers) => {
      teachers.map((teacher) => {
        const index = teacher.waitings
          .map((waiting) => waiting.user)
          .indexOf(req.params.student_id);
        teacher.waitings.splice(index, 1);
        const courseIndex = teacher.courses
          .map((course) => course.courseId)
          .indexOf(req.params.student_id);
        teacher.courses.splice(courseIndex, 1);
        teacher.save().then((user) => res.json(user));
      });
    });
  }
);

router.post(
  "/remove-teacher/:teacher_id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Admin.findOne({ _id: req.user.id }).then((admin) => {
      if (admin) {
        Teacher.findByIdAndDelete(req.params.teacher_id).then(
          (err, teacher) => {
            if (err) return next(err);
            res.json("DELETED");
          }
        );
      }
    });
    Student.find().then((students) => {
      students.map((student) => {
        const index = student.waitings
          .map((waiting) => waiting.user)
          .indexOf(req.params.teacher_id);
        student.waitings.splice(index, 1);
        const courseIndex = student.courses
          .map((course) => course.courseId)
          .indexOf(req.params.teacher_id);
        student.courses.splice(courseIndex, 1);
        student.save().then((user) => res.json(user));
      });
    });
  }
);

router.post(
  "/remove-course/:user_id/:course_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Teacher.findOne({ _id: req.params.user_id }).then((teacher) => {
      Student.findOne({ _id: req.params.user_id }).then((student) => {
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
              .indexOf(req.params.user_id);
            target.save().then((user) => res.json(user));
            user.courses.splice(removeIndex, 1);
            user.save().then((user) => res.json(user));
          });
        });
      });
    });
  }
);

router.post(
  "/remove-waiting/:user_id/:waiting_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Teacher.findOne({ _id: req.params.user_id }).then((teacher) => {
      Student.findOne({ _id: req.params.user_id }).then((student) => {
        Student.findById(req.params.waiting_id).then((tWaiting) => {
          Teacher.findById(req.params.waiting_id).then((sWaiting) => {
            let target;
            if (tWaiting) {
              target = tWaiting;
            }
            if (sWaiting) {
              target = sWaiting;
            }
            if (teacher) {
              user = teacher;
            }
            if (student) {
              user = student;
            }

            const removeTargetIndex = target.waitings
              .map((item) => item.user)
              .indexOf(req.params.waiting_id);
            target.waitings.splice(removeTargetIndex, 1);
            const removeIndex = user.waitings
              .map((item) => item.user)
              .indexOf(req.params.user_id);
            target.save().then((user) => res.json(user));
            user.waitings.splice(removeIndex, 1);
            user.save().then((user) => res.json(user));
          });
        });
      });
    });
  }
);

module.exports = router;
