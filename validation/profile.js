const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProfileInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.address = !isEmpty(data.address) ? data.address : "";
  data.phone = !isEmpty(data.phone) ? data.phone : "";
  data.city = !isEmpty(data.city) ? data.city : "";
  data.course = !isEmpty(data.course) ? data.course : "";
  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be between 2 and 30 characters!";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name Is Required!";
  }

  if (Validator.isEmpty(data.city)) {
    errors.city = "City Is Required!";
  }
  if (Validator.isEmpty(data.course)) {
    errors.course = "Course Is Required!";
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

  if (!isEmpty(data.website)) {
    if (!Validator.isURL(data.website)) {
      errors.website = "Not a valid URL";
    }
  }

  if (!isEmpty(data.youtube)) {
    if (!Validator.isURL(data.youtube)) {
      errors.youtube = "Not a valid URL";
    }
  }

  if (!isEmpty(data.twitter)) {
    if (!Validator.isURL(data.twitter)) {
      errors.twitter = "Not a valid URL";
    }
  }

  if (!isEmpty(data.facebook)) {
    if (!Validator.isURL(data.facebook)) {
      errors.facebook = "Not a valid URL";
    }
  }

  if (!isEmpty(data.linkedin)) {
    if (!Validator.isURL(data.linkedin)) {
      errors.linkedin = "Not a valid URL";
    }
  }

  if (!isEmpty(data.instagram)) {
    if (!Validator.isURL(data.instagram)) {
      errors.instagram = "Not a valid URL";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
