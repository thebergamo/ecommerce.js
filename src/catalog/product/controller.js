'use strict';

function ProductController (db) {
  this.database = db;
  this.model = db.Product;
}

ProductController.prototype = {
  list,
  read,
  create,
  update,
  destroy
};

module.exports = ProductController;

// [GET] /product
function list (request, reply) {
  this.model.findAll({})
  .then((products) => reply(products))
  .catch((err) => reply.badImplementation(err.message));
}

// [GET] /product/{id}
function read (request, reply) {
  const id = request.params.id;

  this.model.findById(id)
  .then((product) => {
    if (!product) {
      return reply.notFound();
    }

    reply(product);
  })
  .catch((err) => reply.badImplementation(err.message));
}

// [POST] /product
function create (request, reply) {
  const payload = request.payload;
  const categories = request.payload.category;

  delete request.payload.category;

  this.model.create(payload)
  .then((product) => {
    return product.addCategories(categories)
    .then(() => {
      return product.getCategories()
      .then((categories) => {
        product = product.get({ plain: true });
        product['categories'] = categories;
        return product;
      });
    });
  })
  .then((product) => reply(product).code(201))
  .catch((err) => reply.badImplementation(err.message));
}

// [PUT] /product
function update (request, reply) {
  const id = request.params.id;
  const payload = request.payload;
  const categories = request.payload.category;

  delete request.payload.category;

  this.model.findById(id)
  .then((product) => {
    return product.addCategories(categories);
    .then(() => {
      return product.getCategories()
      .then((categories) => {
        product = product.get({ plain: true });
        product['categories'] = categories;
        return product;
      });
    });
  })
  .then((product) => product.update(payload))
  .then((product) => reply(product))
  .catch((err) => reply.badImplementation(err.message));
}

// [DELETE] /product
function destroy (request, reply) {
  const id = request.params.id;

  this.model.findById(id)
  .then((product) => product.destroy())
  .then(() => reply({}))
  .catch((err) => reply.badImplementation(err.message));
}
