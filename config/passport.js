const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const Teacher = mongoose.model("teachers");
const Student = mongoose.model("students");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "secret";

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      Teacher.findById(jwt_payload.id)
        .then(teacher => {
          Student.findById(jwt_payload.id).then(student => {
            if (teacher) {
              user = teacher;
            }
            if (student) {
              user = student;
            }
            if (user) {
              return done(null, user);
            }
            return done(null, false);
          });
        })
        .catch(err => console.log(err));
    })
  );
};
