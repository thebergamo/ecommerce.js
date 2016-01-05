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

const schema = {
  firstName: Joi
    .string()
    .min(1)
    .max(100)
    .trim(),
  lastName: Joi
    .string()
    .min(1)
    .max(50)
    .trim(),
  username: Joi
    .string()
    .min(1)
    .max(40)
    .trim(),
  roles: Joi
    .string()
    .valid(['admin', 'publisher', 'customer']),
  email: Joi
    .string()
    .email(),
  password: Joi
    .string()
    .min(8)
    .max(30)
    .trim()
    .regex(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, 'strong password')
};

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
      firstName: schema
        .firstName
        .required(),
      lastName: schema
        .lastName
        .required(),
      username: schema
        .username
        .required(),
      roles: schema
        .roles
        .required(),
      email: schema
        .email
        .required(),
      password: schema
        .password
        .required()
    }
  };
}

function logIn () {
  return {
    payload: {
      email: schema
        .email
        .required(),
      password: schema
        .password
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
      firstName: schema
        .firstName
        .optional(),
      lastName: schema
        .lastName
        .optional(),
      username: schema
        .username
        .optional(),
      roles: schema
        .roles
        .optional(),
      email: schema
        .email
        .optional(),
      password: schema
        .password
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

