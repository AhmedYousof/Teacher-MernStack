const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");

//@Route POST localhost:3000/admin/add-course
//@DESC Add new course
router.post("/add-course", (req, res, next) => {
  const newCourse = new Course({
    name: req.body.name
  });
  newCourse
    .save()
    .then(course => {
      res.json(course);
    })
    .catch(err => {
      res.status(400).json(err);
    });
});

router.get("/courses", (req, res) => {
  Course.find()
    .then(courses => {
      if (!courses) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }

      res.json(courses);
    })
    .catch(err => res.status(404).json(err));
});

module.exports = router;
