/* global describe, beforeEach, before, it, expect, db, server */
'use strict';

const Promise = require('bluebird');

describe('Routes /product', () => {
  let userInfo;

  before((done) => {
    return db.User.truncate({})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {
            firstName: 'Marcos',
            lastName: 'Bérgamo',
            username: 'thebergamo',
            roles: 'admin',
            email: 'marcos@marcos.com',
            password: 'Aw3s0m#01'
          }
        };

        server.inject(options, (response) => {
          userInfo = response.result.token;
          return done();
        });
      });
  });

  describe('GET /product', () => {
    beforeEach((done) => {
      return db.Product.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/product',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {}
        };

        for (let i = 0; i < 5; i++) {
          options.payload = {
            name: 'Product ' + i,
            description: 'Some awesome product here!',
            model: 'PS01E' + i,
            upc: '1234567890123',
            price: 100.50,
            status: true
          };

          server.inject(options, (response) => {
            if (i === 4) {
              return done();
            }
          });
        }
      });
    });

    describe('when user is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'GET', url: '/product'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });
    });

    it('return 200 HTTP status code', (done) => {
      db.Product.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'GET',
          url: '/product',
          headers: {'Authorization': 'Bearer ' + userInfo}
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });
    });

    it('return an empty array when users is empty', (done) => {
      db.Product.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'GET',
          url: '/product',
          headers: {'Authorization': 'Bearer ' + userInfo}
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('result');
          expect(response.result).to.have.length.least(0);
          done();
        });
      });
    });

    it('return 5 users at a time', (done) => {
      const options = {
        method: 'GET',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('result');
        expect(response.result).to.have.length.least(5);
        expect(response.result).to.contain.a.thing.with.property('name');
        expect(response.result).to.contain.a.thing.with.property('description');
        expect(response.result).to.contain.a.thing.with.property('model');
        expect(response.result).to.contain.a.thing.with.property('upc');
        expect(response.result).to.contain.a.thing.with.property('price');
        expect(response.result).to.contain.a.thing.with.property('status');
        done();
      });
    });
  });

  describe('GET /product/{id}', () => {
    let product;
    before((done) => {
      return db.Product.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/product',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            name: 'Moto X',
            description: 'Cool moto x with 32GB internal storage!!',
            model: 'XT1097',
            upc: '7892597336616',
            price: 1499.00,
            status: true
          }
        };

        server.inject(options, (response) => {
          product = response.result;
          done();
        });
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'GET', url: '/product/' + product.id};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });
    });

    describe('when request is authenticated', () => {
      it('returns 200 HTTP status code', (done) => {
        const options = {
          method: 'GET',
          url: '/product/' + product.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });

      it('returns 1 product at a time', (done) => {
        const options = {
          method: 'GET',
          url: '/product/' + product.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response.result).to.have.property('id', product.id);
          expect(response.result).to.have.property('name', product.name);
          expect(response.result).to.have.property('description', product.description);
          expect(response.result).to.have.property('model', product.model);
          expect(response.result).to.have.property('upc', product.upc);
          expect(response.result).to.have.property('price', product.price);
          expect(response.result).to.have.property('status', product.status);
          done();
        });
      });

      it('return 400 HTTP status code when the specified id is invalid', (done) => {
        const options = {
          method: 'GET',
          url: '/product/aa',
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "id" fails because ["id" must be a number]');
          done();
        });
      });

      it('return 404 HTTP status code when the specified id is not found', (done) => {
        const options = {
          method: 'GET',
          url: '/product/1000',
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 404);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 404);
          expect(response.result).to.have.property('error', 'Not Found');

          done();
        });
      });
    });
  });

  describe('POST /product', () => {
    before((done) => {
      return db.Product.destroy({where: {}})
      .then(() => {
        done();
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'POST', url: '/product'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no body is sended', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', '"value" must be an object');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `name` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `name` is empty', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: ''}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `name` isn\'t a string', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 0}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `name` haven\'t more than 100 chars', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" length must be less than or equal to 100 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `price` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: { name: 'Moto X' }};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "price" fails because ["price" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `price` isn\'t a number', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: { name: 'Moto X', price: 'a' }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "price" fails because ["price" must be a number]');
        done();
      });
    });

    it('return 400 HTTP status code when `price` isn\'t a positive number ', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: { name: 'Moto X', price: -1 }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "price" fails because ["price" must be a positive number]');
        done();
      });
    });

    it('returns 201 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'Moto X',
          description: 'Cool moto x with 32GB internal storage!!',
          model: 'XT1097',
          upc: '7892597336616',
          price: 1499.00,
          status: true
        }};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 201);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('name', 'Moto X');
        expect(response.result).to.have.property('description', 'Cool moto x with 32GB internal storage!!');
        expect(response.result).to.have.property('model', 'XT1097');
        expect(response.result).to.have.property('upc', '7892597336616');
        expect(response.result).to.have.property('price', 1499.00);
        expect(response.result).to.have.property('status', true);
        done();
      });
    });

    describe('when a product have category', () => {
      let categories;

      before((done) => {
        return db.Category.destroy({where: {}})
          .then(() => {
            const cat0 = { name: 'Telephony', description: '', status: true };
            const cat1 = { name: 'Computer', description: '', status: true };
            return Promise.props({
              cat: db.Category.create(cat0),
              cat2: db.Category.create(cat1)
            });
          })
          .then((result) => {
            categories = [result.cat, result.cat2];
            return done();
          });
      });

      it('returns 201 HTTP status code when a single category is send', (done) => {
        const options = {
          method: 'POST',
          url: '/product',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            name: 'Moto X 2',
            description: 'Cool moto x with 64GB internal storage!!',
            model: 'XT1098',
            upc: '7892597336617',
            price: 1499.00,
            category: categories[0].id,
            status: true
          }};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 201);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('name', 'Moto X 2');
          expect(response.result).to.have.property('description', 'Cool moto x with 64GB internal storage!!');
          expect(response.result).to.have.property('model', 'XT1098');
          expect(response.result).to.have.property('upc', '7892597336617');
          expect(response.result).to.have.property('price', 1499.00);
          expect(response.result).to.have.property('status', true);
          expect(response.result).to.have.property('categories');
          expect(response.result.categories).to.be.an('array');
          expect(response.result.categories.length).to.have.least(1);
          expect(response.result.categories).to.contain.a.thing.with.property('name');
          expect(response.result.categories).to.contain.a.thing.with.property('status');

          done();
        });
      });

      it('returns 201 HTTP status code when multiple categories are send', (done) => {
        const options = {
          method: 'POST',
          url: '/product',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            name: 'Moto X 3',
            description: 'Cool moto x with 128GB internal storage!!',
            model: 'XT1099',
            upc: '7892597336618',
            price: 1499.00,
            category: [categories[0].id, categories[1].id],
            status: true
          }};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 201);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('name', 'Moto X 3');
          expect(response.result).to.have.property('description', 'Cool moto x with 128GB internal storage!!');
          expect(response.result).to.have.property('model', 'XT1099');
          expect(response.result).to.have.property('upc', '7892597336618');
          expect(response.result).to.have.property('price', 1499.00);
          expect(response.result).to.have.property('status', true);
          expect(response.result).to.have.property('categories');
          expect(response.result.categories).to.be.an('array');
          expect(response.result.categories.length).to.have.least(2);
          expect(response.result.categories).to.contain.a.thing.with.property('name');
          expect(response.result.categories).to.contain.a.thing.with.property('status');
          done();
        });
      });
    });
  });

  describe('PUT /product/{id}', () => {
    let product;
    before((done) => {
      return Promise.all([db.ProductCategory.destroy({where: {}}), db.Product.destroy({where: {}})])
      .then(() => {
        const options = {
          method: 'POST',
          url: '/product',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            name: 'Moto X',
            description: 'Cool moto x with 32GB internal storage!!',
            model: 'XT1097',
            upc: '7892597336616',
            price: 1499.00,
            status: true
          }
        };

        server.inject(options, (response) => {
          product = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code  when `name` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 0}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `name` haven\'t more than 100 chars', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" length must be less than or equal to 100 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `description` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 'Moto X', description: 0}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "description" fails because ["description" must be a string]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `model` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 'Moto X', model: 0}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "model" fails because ["model" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `model` haven\'t more than 50 chars', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 'Moto X', model: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "model" fails because ["model" length must be less than or equal to 50 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `upc` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 'Moto X', model: 'XT001', upc: 0}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "upc" fails because ["upc" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `upc` haven\'t more than 13 chars', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 'Moto X', model: 'XT0001', upc: 'aaaaaaaaaaaaaaa'}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "upc" fails because ["upc" length must be less than or equal to 13 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `price` isn\'t a number', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: { name: 'Moto X', price: 'a' }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "price" fails because ["price" must be a number]');
        done();
      });
    });

    it('return 400 HTTP status code when `price` isn\'t a positive number ', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: { name: 'Moto X', price: 0 }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "price" fails because ["price" must be a positive number]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `status` isn\'t a boolean', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 'Moto X', model: 'XT001', upc: '1234567890123', status: 'ok'}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "status" fails because ["status" must be a boolean]');
        done();
      });
    });

    it('returns 200 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        payload: {
          name: 'Moto X 2',
          description: 'Cool moto x with 64GB internal storage!!',
          model: 'XT1098',
          upc: '7892597336617',
          price: 2499.00,
          status: false
        },
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('id', product.id);
        expect(response.result).to.have.property('name', 'Moto X 2');
        expect(response.result).to.have.property('description', 'Cool moto x with 64GB internal storage!!');
        expect(response.result).to.have.property('model', 'XT1098');
        expect(response.result).to.have.property('upc', '7892597336617');
        expect(response.result).to.have.property('price', 2499.00);
        expect(response.result).to.have.property('status', false);
        done();
      });
    });

    describe('when a product have category', () => {
      let categories;

      before((done) => {
        return db.Category.destroy({where: {}})
          .then(() => {
            const cat0 = { name: 'Telephony', description: '', status: true };
            const cat1 = { name: 'Computer', description: '', status: true };
            return Promise.props({
              cat: db.Category.create(cat0),
              cat2: db.Category.create(cat1)
            });
          })
          .then((result) => {
            categories = [result.cat, result.cat2];
            return done();
          });
      });

      it('returns 200 HTTP status code when a single category is send', (done) => {
        const id = product.id;

        product.category = categories[0].id;
        delete product.id;
        delete product.categories;
        delete product.created_at;
        delete product.update_at;

        const options = {
          method: 'PUT',
          url: '/product/' + id,
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: product
        };
        server.inject(options, (response) => {
          product = response.result;

          expect(response).to.have.property('statusCode', 200);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('name', 'Moto X');
          expect(response.result).to.have.property('description', 'Cool moto x with 32GB internal storage!!');
          expect(response.result).to.have.property('model', 'XT1097');
          expect(response.result).to.have.property('upc', '7892597336616');
          expect(response.result).to.have.property('price', 1499.00);
          expect(response.result).to.have.property('status', true);
          expect(response.result).to.have.property('categories');
          expect(response.result.categories).to.be.an('array');
          expect(response.result.categories.length).to.have.least(1);
          expect(response.result.categories).to.contain.a.thing.with.property('name');
          expect(response.result.categories).to.contain.a.thing.with.property('status');

          done();
        });
      });

      it('returns 200 HTTP status code when multiple categories are send', (done) => {
        const id = product.id;

        product.category = [categories[0].id, categories[1].id];
        delete product.id;
        delete product.categories;
        delete product.created_at;
        delete product.update_at;

        const options = {
          method: 'PUT',
          url: '/product/' + id,
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: product
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('name', 'Moto X');
          expect(response.result).to.have.property('description', 'Cool moto x with 32GB internal storage!!');
          expect(response.result).to.have.property('model', 'XT1097');
          expect(response.result).to.have.property('upc', '7892597336616');
          expect(response.result).to.have.property('price', 1499.00);
          expect(response.result).to.have.property('status', true);
          expect(response.result).to.have.property('categories');
          expect(response.result.categories).to.be.an('array');
          expect(response.result.categories.length).to.have.least(2);
          expect(response.result.categories).to.contain.a.thing.with.property('name');
          expect(response.result.categories).to.contain.a.thing.with.property('status');
          done();
        });
      });
    });
  });

  describe('DELETE /product/{id}', () => {
    let product;
    before((done) => {
      return Promise.all([db.ProductCategory.destroy({where: {}}), db.Product.destroy({where: {}})])
      .then(() => {
        const options = {
          method: 'POST',
          url: '/product',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            name: 'Moto X',
            description: 'Cool moto x with 32GB internal storage!!',
            model: 'XT1097',
            upc: '7892597336616',
            price: 1499.00,
            status: true
          }
        };

        server.inject(options, (response) => {
          product = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      const options = {
        method: 'DELETE',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "id" fails because ["id" is required]');
        done();
      });
    });

    it('returns 200 HTTP status code when record is deleted', (done) => {
      const options = {
        method: 'DELETE',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.be.empty;
        done();
      });
    });
  });
});

