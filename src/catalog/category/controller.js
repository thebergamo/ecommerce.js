'use strict';

function CategoryController (db) {
  this.database = db;
  this.model = db.Category;
}

CategoryController.prototype = {
  list,
  read,
  create,
  update,
  destroy,
  inactive
};

module.exports = CategoryController;

// [GET] /category
function list (request, reply) {
  this.model.scope({ method: ['states', true] }).findAll()
  .then((categories) => reply(categories))
  .catch((err) => reply.badImplementation(err.message));
}

// [GET] /category/inactive
function inactive (request, reply) {
  this.model.scope({ method: ['states', false] }).findAll()
  .then((categories) => reply(categories))
  .catch((err) => reply.badImplementation(err.message));
}

// [GET] /category/{id}
function read (request, reply) {
  const id = request.params.id;

  this.model.findById(id)
  .then((category) => {
    if (!category) {
      return reply.notFound();
    }

    reply(category);
  })
  .catch((err) => reply.badImplementation(err.message));
}

// [POST] /category
function create (request, reply) {
  const payload = request.payload;

  this.model.create(payload)
  .then((category) => reply(category).code(201))
  .catch((err) => reply.badImplementation(err.message));
}

// [PUT] /category
function update (request, reply) {
  const id = request.params.id;
  const payload = request.payload;

  this.model.findById(id)
  .then((category) => category.update(payload))
  .then((category) => reply(category))
  .catch((err) => reply.badImplementation(err.message));
}

// [DELETE] /category
function destroy (request, reply) {
  const id = request.params.id;

  this.model.findById(id)
  .then((category) => category.destroy())
  .then(() => reply({}))
  .catch((err) => reply.badImplementation(err.message));
}

