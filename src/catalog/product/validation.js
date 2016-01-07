'use strict';

// load deps
const Joi = require('joi');

const ProductValidator = {
  list,
  read,
  create,
  logIn,
  update,
  destroy
};

module.exports = ProductValidator;

const schema = {
  name: Joi
    .string()
    .min(1)
    .max(100)
    .trim(),
  description: Joi
    .string()
    .default(''),
  model: Joi
    .string()
    .min(1)
    .max(50)
    .trim(),
  upc: Joi
    .string()
    .max(13)
    .trim(),
  price: Joi
    .number()
    .precision(2)
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
        .string()
        .guid()
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
      model: schema
        .model
        .optional(),
      upc: schema
        .upc
        .optional(),
      price: schema
        .price
        .required(),
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
        .string()
        .guid()
        .required()
    },
    payload: {
      name: schema
        .name
        .optional(),
      description: schema
        .description
        .optional(),
      model: schema
        .model
        .optional(),
      upc: schema
        .upc
        .optional(),
      price: schema
        .price
        .optinal(),
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
        .string()
        .guid()
        .required()
    }
  };
}

