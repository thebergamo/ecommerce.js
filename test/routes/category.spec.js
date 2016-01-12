/* global describe, beforeEach, before, it, expect, db, server */
'use strict';

describe('Routes /category', () => {
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

  describe('GET /category', () => {
    beforeEach((done) => {
      return db.Category.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/category',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {}
        };

        for (let i = 0; i < 5; i++) {
          options.payload = {
            name: 'Category ' + i,
            description: 'Some awesome category here!',
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
        const options = {method: 'GET', url: '/category'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });
    });

    it('return 200 HTTP status code', (done) => {
      db.Category.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'GET',
          url: '/category',
          headers: {'Authorization': 'Bearer ' + userInfo}
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });
    });

    it('return an empty array when category is empty', (done) => {
      db.Product.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'GET',
          url: '/category',
          headers: {'Authorization': 'Bearer ' + userInfo}
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('result');
          expect(response.result).to.have.length.least(0);
          done();
        });
      });
    });

    it('return 5 categories at a time', (done) => {
      const options = {
        method: 'GET',
        url: '/category',
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('result');
        expect(response.result).to.have.length.least(5);
        expect(response.result).to.contain.a.thing.with.property('name');
        expect(response.result).to.contain.a.thing.with.property('description');
        expect(response.result).to.contain.a.thing.with.property('status');
        done();
      });
    });
  });

  describe('GET /category/inactive', () => {
    beforeEach((done) => {
      return db.Category.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/category',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {}
        };

        for (let i = 0; i < 5; i++) {
          options.payload = {
            name: 'Category ' + i,
            description: 'Some awesome category here!',
            status: i === 0
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
        const options = {method: 'GET', url: '/category/inactive'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });
    });

    it('return 200 HTTP status code', (done) => {
      db.Category.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'GET',
          url: '/category/inactive',
          headers: {'Authorization': 'Bearer ' + userInfo}
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });
    });

    it('return an empty array when category is empty', (done) => {
      db.Category.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'GET',
          url: '/category/inactive',
          headers: {'Authorization': 'Bearer ' + userInfo}
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('result');
          expect(response.result).to.have.length.least(0);
          done();
        });
      });
    });

    it('return 4 categories at a time', (done) => {
      const options = {
        method: 'GET',
        url: '/category/inactive',
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('result');
        expect(response.result).to.have.length(4);
        expect(response.result).to.contain.a.thing.with.property('name');
        expect(response.result).to.contain.a.thing.with.property('description');
        expect(response.result).to.contain.a.thing.with.property('status');
        done();
      });
    });
  });

  describe('GET /category/{id}', () => {
    let category;
    before((done) => {
      return db.Category.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/category',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            name: 'Smartphones',
            description: 'Awesome smartphones are here!!',
            status: true
          }
        };

        server.inject(options, (response) => {
          category = response.result;
          done();
        });
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'GET', url: '/category/' + category.id};
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
          url: '/category/' + category.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });

      it('returns 1 category at a time', (done) => {
        const options = {
          method: 'GET',
          url: '/category/' + category.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response.result).to.have.property('id', category.id);
          expect(response.result).to.have.property('name', category.name);
          expect(response.result).to.have.property('description', category.description);
          expect(response.result).to.have.property('status', category.status);
          done();
        });
      });

      it('return 400 HTTP status code when the specified id is invalid', (done) => {
        const options = {
          method: 'GET',
          url: '/category/aa',
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
          url: '/category/1000',
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

  describe('POST /category', () => {
    before((done) => {
      return db.Category.destroy({where: {}})
      .then(() => {
        done();
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'POST', url: '/category'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no body is sended', (done) => {
      const options = {
        method: 'POST',
        url: '/category',
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
        url: '/category',
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
        url: '/category',
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
        url: '/category',
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
        url: '/category',
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

    it('returns 201 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'POST',
        url: '/category',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'Smartphones',
          description: 'Awesome smartphones are here!!',
          status: true
        }};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 201);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('name', 'Smartphones');
        expect(response.result).to.have.property('description', 'Awesome smartphones are here!!');
        expect(response.result).to.have.property('status', true);
        done();
      });
    });

    describe('when a parent is specified', () => {
      let category;
      before((done) => {
        return db.Category.destroy({where: {}})
        .then(() => {
          const options = {
            method: 'POST',
            url: '/category',
            headers: {'Authorization': 'Bearer ' + userInfo},
            payload: {
              name: 'telephony',
              description: 'All related to telephony',
              status: true
            }
          };

          server.inject(options, (response) => {
            category = response.result;
            done();
          });
        });
      });

      it('returns 201 HTTP status code when all data is correct', (done) => {
        const options = {
          method: 'POST',
          url: '/category',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            name: 'Smartphones',
            description: 'Awesome smartphones are here!!',
            parentId: category.id,
            status: true
          }};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 201);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('name', 'Smartphones');
          expect(response.result).to.have.property('parentId', category.id);
          expect(response.result).to.have.property('description', 'Awesome smartphones are here!!');
          expect(response.result).to.have.property('status', true);
          done();
        });
      });
    });
  });

  describe('PUT /category/{id}', () => {
    let category;
    before((done) => {
      return db.Category.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/category',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            name: 'Smartphones',
            description: 'Awesome smartphones are here!!',
            status: true
          }
        };

        server.inject(options, (response) => {
          category = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code  when `name` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/category/' + category.id,
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
        url: '/category/' + category.id,
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
        url: '/category/' + category.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 'Smartphone', description: 0}
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

    it('returns 400 HTTP status code  when `status` isn\'t a boolean', (done) => {
      const options = {
        method: 'PUT',
        url: '/category/' + category.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 'Smartphone', description: 'Smartphone rulez', status: 'ok'}
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
        url: '/category/' + category.id,
        payload: {
          name: 'Smartphone',
          description: 'Awesomeness smartphones are here!!',
          status: false
        },
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('id', category.id);
        expect(response.result).to.have.property('name', 'Smartphone');
        expect(response.result).to.have.property('description', 'Awesomeness smartphones are here!!');
        expect(response.result).to.have.property('status', false);
        done();
      });
    });
  });

  describe('DELETE /category/{id}', () => {
    let category;
    before((done) => {
      return db.Category.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/category',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            name: 'Smartphones',
            description: 'Awesome smartphones are here!!',
            status: true
          }
        };

        server.inject(options, (response) => {
          category = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      const options = {
        method: 'DELETE',
        url: '/category',
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
        url: '/category/' + category.id,
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

