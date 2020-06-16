const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateAdminRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirmpassword = !isEmpty(data.confirmpassword)
    ? data.confirmpassword
    : "";

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be between 2 and 30 characters!";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name Is Required!";
  }
  if (!Validator.isEmail(data.email)) {
    errors.email = "Email Is InValid!";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email  is Required!";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "password Is Required!";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password Must Be Between 6 and 30 characters!";
  }
  if (Validator.isEmpty(data.confirmpassword)) {
    errors.confirmpassword = "Confirm Password Is Required!";
  }
  if (!Validator.equals(data.confirmpassword, data.password)) {
    errors.confirmpassword = "Passwords Must Match!";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
