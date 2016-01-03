'use strict';

// load deps
const Joi = require('joi');

const UserValidator = {
  list,
  read,
  create,
  logIn,
  update,
  destroy
};

module.exports = UserValidator;

function list () {
  return {};
}

function read () {
  return {
    params: {
      id: Joi
        .string()
        .guid()
        .required()
    }
  };
}

function create () {
  return {
    payload: {
      firstName: Joi
        .string()
        .min(1)
        .max(100)
        .trim()
        .required(),
      lastName: Joi
        .string()
        .min(1)
        .max(50)
        .trim()
        .required(),
      username: Joi
        .string()
        .min(1)
        .max(40)
        .trim()
        .required(),
      roles: Joi
        .string()
        .valid(['admin', 'publisher', 'customer'])
        .required(),
      email: Joi
        .string()
        .email()
        .required(),
      password: Joi
        .string()
        .min(8)
        .max(30)
        .trim()
        .required()
    }
  };
}

function logIn () {
  return {
    payload: {
      email: Joi
        .string()
        .email()
        .required(),
      password: Joi
        .string()
        .trim()
        .required()
    }
  };
}

function update () {
  return {
    params: {
      id: Joi
        .string()
        .guid()
        .required()
    },
    payload: {
      firstName: Joi
        .string()
        .min(1)
        .max(100)
        .trim()
        .optional(),
      lastName: Joi
        .string()
        .min(1)
        .max(50)
        .trim()
        .optional(),
      username: Joi
        .string()
        .min(1)
        .max(40)
        .trim()
        .optional(),
      roles: Joi
        .string()
        .valid(['admin', 'publisher', 'customer'])
        .optional(),
      email: Joi
        .string()
        .email()
        .optional(),
      password: Joi
        .string()
        .min(8)
        .max(30)
        .trim()
        .optional()
    }
  };
}

function destroy () {
  return {
    params: {
      id: Joi
        .string()
        .guid()
        .required()
    }
  };
}

