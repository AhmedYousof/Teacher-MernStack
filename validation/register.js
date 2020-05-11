const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirmpassword = !isEmpty(data.confirmpassword)
    ? data.confirmpassword
    : "";
  data.address = !isEmpty(data.address) ? data.address : "";
  data.phone = !isEmpty(data.phone) ? data.phone : "";
  data.city = !isEmpty(data.city) ? data.city : "";

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
  if (Validator.isEmpty(data.city)) {
    errors.city = "City Is Required!";
  }

  if (Validator.isEmpty(data.address)) {
    errors.address = "Address Is Required!";
  }
  if (Validator.isEmpty(data.phone)) {
    errors.phone = "Phone Is Required!";
  }
  if (!Validator.isLength(data.phone, { min: 11, max: 11 })) {
    errors.phone = "Phone Must Be 11 characters!";
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
    isValid: isEmpty(errors)
  };
};
