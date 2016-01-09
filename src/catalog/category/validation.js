'use strict';

// load deps
const Joi = require('joi');

const CategoryValidator = {
  list,
  read,
  create,
  update,
  destroy
};

module.exports = CategoryValidator;

const schema = {
  name: Joi
    .string()
    .min(1)
    .max(100)
    .trim(),
  description: Joi
    .string()
    .default(''),
  parentId: Joi
    .number()
    .positive(),
  status: Joi
    .boolean()
    .default(false)
};

function list () {
  return {};
}

function read () {
  return {
    params: {
      id: Joi
        .number()
        .integer()
        .positive()
        .required()
    }
  };
}

function create () {
  return {
    payload: {
      name: schema
        .name
        .required(),
      description: schema
        .description
        .optional(),
      parentId: schema
        .parentId
        .optional(),
      status: schema
        .status
        .optional()
    }
  };
}

function update () {
  return {
    params: {
      id: Joi
        .number()
        .integer()
        .positive()
        .required()
    },
    payload: {
      name: schema
        .name
        .optional(),
      description: schema
        .description
        .optional(),
      parentId: schema
        .parentId
        .optional(),
      status: schema
        .status
        .optional()
    }
  };
}

function destroy () {
  return {
    params: {
      id: Joi
        .number()
        .integer()
        .positive()
        .required()
    }
  };
}

