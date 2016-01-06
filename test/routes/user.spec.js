/* global describe, beforeEach, before, it, expect, db, server */
'use strict';

let jwt = require('jsonwebtoken');
const SECRET = process.env.JWT || 'stubJWT';

describe('Routes /user', () => {
  describe('GET /user', () => {
    beforeEach((done) => {
      return db.User.truncate()
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {}
        };

        for (let i = 0; i < 5; i++) {
          options.payload = {
            firstName: 'User ' + i,
            lastName: 'Doe',
            password: 'JK1234$eco',
            username: 'user_' + i,
            email: 'user_' + i + '@example.com',
            roles: 'admin'
          };

          server.inject(options, (response) => {
            if (i === 4) {
              return done();
            }
          });
        }
      });
    });

    it('return 200 HTTP status code', (done) => {
      db.User.truncate()
      .then(() => {
        const options = {method: 'GET', url: '/user'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });
    });

    it('return an empty array when users is empty', (done) => {
      db.User.truncate()
      .then(() => {
        let options = {method: 'GET', url: '/user'};
        server.inject(options, (response) => {
          expect(response).to.have.property('result');
          expect(response.result).to.have.length.least(0);
          done();
        });
      });
    });

    it('return 5 users at a time', (done) => {
      const options = {method: 'GET', url: '/user'};
      server.inject(options, (response) => {
        expect(response).to.have.property('result');
        expect(response.result).to.have.length.least(5);
        expect(response.result).to.contain.a.thing.with.property('firstName');
        expect(response.result).to.contain.a.thing.with.property('lastName');
        expect(response.result).to.contain.a.thing.with.property('roles');
        expect(response.result).to.contain.a.thing.with.property('username');
        expect(response.result).to.contain.a.thing.with.property('email');
        done();
      });
    });
  });

  describe('GET /user/{id}', () => {
    let token;
    let userInfo;
    before((done) => {
      return db.User.truncate()
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {
            firstName: 'Jack',
            lastName: 'Bauer',
            username: 'jack_b',
            roles: 'publisher',
            email: 'jbauer@24hours.com',
            password: '#24hoursRescuePresident'
          }
        };

        server.inject(options, (response) => {
          token = response.result.token;
          userInfo = jwt.verify(token, SECRET);
          done();
        });
      });
    });

    describe('when user is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'GET', url: '/user/' + userInfo.id};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });
    });

    describe('when user is authenticated', () => {
      it('returns 200 HTTP status code', (done) => {
        const options = {
          method: 'GET',
          url: '/user/' + userInfo.id,
          headers: {'Authorization': 'Bearer ' + token}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });

      it('returns 1 user at a time', (done) => {
        const options = {
          method: 'GET',
          url: '/user/' + userInfo.id,
          headers: {'Authorization': 'Bearer ' + token}
        };

        server.inject(options, (response) => {
          expect(response.result).to.have.property('firstName', 'Jack');
          expect(response.result).to.have.property('lastName', 'Bauer');
          expect(response.result).to.have.property('roles', 'publisher');
          expect(response.result).to.have.property('username', 'jack_b');
          expect(response.result).to.have.property('email', 'jbauer@24hours.com');
          done();
        });
      });

      it('return 400 HTTP status code when the specified id is invalid', (done) => {
        const options = {
          method: 'GET',
          url: '/user/12',
          headers: {'Authorization': 'Bearer ' + token}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "id" fails because ["id" must be a valid GUID]');
          done();
        });
      });

      it('return 404 HTTP status code when the specified id is not found', (done) => {
        const options = {
          method: 'GET',
          url: '/user/8fbf3aaa-c321-4bb0-8222-821e4c8acc7c',
          headers: {'Authorization': 'Bearer ' + token}
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

  describe('POST /user', () => {
    beforeEach((done) => {
      return db.User.truncate()
      .then(() => {
        done();
      });
    });

    it('returns 400 HTTP status code when no body is sended', (done) => {
      const options = {method: 'POST', url: '/user'};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', '"value" must be an object');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `fistName` is send', (done) => {
      const options = {method: 'POST', url: '/user', payload: {}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "firstName" fails because ["firstName" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `firstName` is empty', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: ''}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "firstName" fails because ["firstName" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `firstName` isn\'t a string', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 0}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "firstName" fails because ["firstName" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `firstName` haven\'t more than 100 chars', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "firstName" fails because ["firstName" length must be less than or equal to 100 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `lastName` is send', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "lastName" fails because ["lastName" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `lastName` is empty', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: ''}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "lastName" fails because ["lastName" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `lastName` isn\'t a string', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 0}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "lastName" fails because ["lastName" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `lastName` haven\'t more than 50 chars', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "lastName" fails because ["lastName" length must be less than or equal to 50 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `username` is send', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "username" fails because ["username" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `username` is empty', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: ''}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "username" fails because ["username" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `username` isn\'t a string', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 0}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "username" fails because ["username" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `username` haven\'t more than 40 chars', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "username" fails because ["username" length must be less than or equal to 40 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `roles` is send', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'thebergamo'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roles" fails because ["roles" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roles` is empty', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'thebergamo', roles: ''}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roles" fails because ["roles" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roles` isn\'t a string', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'thebergamo', roles: 0}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roles" fails because ["roles" must be a string]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roles` isn\'t a valid role', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'thebergamo', roles: 'guild_master'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roles" fails because ["roles" must be one of [admin, publisher, customer]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `email` is sent', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `email` is empty', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: ''}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `email` isn\'t a string ', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 0}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" must be a string]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `email` is invalid email', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'notanemail'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" must be a valid email]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `password` is sent', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'marcos@thedon.com.br'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "password" fails because ["password" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `password` is empty', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'marcos@thedon.com.br', password: ''}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "password" fails because ["password" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `password` isn\'t a string ', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'marcos@thedon.com.br', password: 0}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "password" fails because ["password" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `password` haven\'t least than 8 chars', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'marcos@thedon.com.br', password: 'aaa'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "password" fails because ["password" length must be at least 8 characters long]');
        done();
      });
    });

    it('return 400 HTTP status code when `password` haven\'t more than 30 chars', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'marcos@thedon.com.br', password: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "password" fails because ["password" length must be less than or equal to 30 characters long]');
        done();
      });
    });

    it('return 400 HTTP status code when `password` isn\'t strong', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'marcos@thedon.com.br', password: 'asdffgghm'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "password" fails because ["password" with value "asdffgghm" fails to match the strong password pattern]');
        done();
      });
    });

    it('returns 201 HTTP status code when all data is correct', (done) => {
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Jack', lastName: 'Bauer', username: 'jack_b', email: 'jack_b@24h.com', roles: 'admin', password: '12#345Mp6'}};
      server.inject(options, (response) => {
        console.log(response.result);
        expect(response).to.have.property('statusCode', 201);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('token');
        done();
      });
    });
  });

  describe('PUT /user/{id}', () => {
    let userInfo;
    let token;
    before((done) => {
      db.User.truncate({})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {
            firstName: 'Jack',
            lastName: 'Bauer',
            username: 'jack_b',
            email: 'jbauer@24hours.com',
            roles: 'admin',
            password: '#24hoursRescuePresident'
          }
        };

        server.inject(options, (response) => {
          token = response.result.token;
          userInfo = jwt.verify(token, SECRET);
          done();
        });
      });
    });

    it('returns 400 HTTP status code  when `firstName` is empty', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: ''},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "firstName" fails because ["firstName" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `firstName` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 0},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "firstName" fails because ["firstName" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `firstName` haven\'t more than 100 chars', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "firstName" fails because ["firstName" length must be less than or equal to 100 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `lastName` is empty', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: ''},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "lastName" fails because ["lastName" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `lastName` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 0},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "lastName" fails because ["lastName" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `lastName` haven\'t more than 50 chars', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "lastName" fails because ["lastName" length must be less than or equal to 50 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `username` is empty', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: ''},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "username" fails because ["username" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `username` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 0},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "username" fails because ["username" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `username` haven\'t more than 40 chars', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "username" fails because ["username" length must be less than or equal to 40 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roles` is empty', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'thebergamo', roles: ''},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roles" fails because ["roles" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roles` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'thebergamo', roles: 0},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roles" fails because ["roles" must be a string]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `roles` isn\'t a valid role', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'thebergamo', roles: 'guild_master'},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "roles" fails because ["roles" must be one of [admin, publisher, customer]]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `email` is empty', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: ''},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `email` isn\'t a string ', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 0},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" must be a string]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `email` is invalid email', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'notanemail'},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" must be a valid email]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `password` is empty', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'marcos@thedon.com.br', password: ''},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "password" fails because ["password" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `password` isn\'t a string ', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'marcos@thedon.com.br', password: 0},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "password" fails because ["password" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `password` haven\'t least than 8 chars', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'marcos@thedon.com.br', password: 'aaa'},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "password" fails because ["password" length must be at least 8 characters long]');
        done();
      });
    });

    it('return 400 HTTP status code when `password` haven\'t more than 30 chars', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'marcos@thedon.com.br', password: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "password" fails because ["password" length must be less than or equal to 30 characters long]');
        done();
      });
    });

    it('return 400 HTTP status code when `password` isn\'t strong', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Marcos', lastName: 'Bergamo', username: 'marc', roles: 'admin', email: 'marcos@thedon.com.br', password: 'asdffgghm'},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "password" fails because ["password" with value "asdffgghm" fails to match the strong password pattern]');
        done();
      });
    });

    it('returns 200 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Jack', lastName: 'Brauer', username: 'jack_br', email: 'jack_br@24h.com', password: 'JB#ddd0123', roles: 'publisher'},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('id', userInfo.id);
        expect(response.result).to.have.property('firstName', 'Jack');
        expect(response.result).to.have.property('lastName', 'Brauer');
        expect(response.result).to.have.property('roles', 'publisher');
        expect(response.result).to.have.property('username', 'jack_br');
        expect(response.result).to.have.property('email', 'jack_br@24h.com');
        done();
      });
    });
  });

  describe('POST /user/login', () => {
    before((done) => {
      db.User.truncate({})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {
            firstName: 'Jack',
            lastName: 'Bauer',
            username: 'jack_b',
            email: 'jbauer@24hours.com',
            roles: 'admin',
            password: '#24hoursRescuePresident'
          }
        };

        server.inject(options, (response) => {
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `email` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/user/login',
        payload: {}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code when no `password` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/user/login',
        payload: {email: 'jack@24h.com'}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "password" fails because ["password" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code when `email` is invalid', (done) => {
      const options = {
        method: 'POST',
        url: '/user/login',
        payload: {email: 'jack'}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" must be a valid email]');
        done();
      });
    });

    it('returns 401 HTTP status code when `email` isn`t in our base', (done) => {
      const options = {
        method: 'POST',
        url: '/user/login',
        payload: {email: 'jack_b@24h.com', password: '0101#lolBBQ'}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 401);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 401);
        expect(response.result).to.have.property('error', 'Unauthorized');
        expect(response.result).to.have.property('message', 'Email or Password invalid');
        done();
      });
    });

    it('returns 401 HTTP status code when `password` is incorrect for this user', (done) => {
      const options = {
        method: 'POST',
        url: '/user/login',
        payload: {email: 'jbauer@24h.com', password: '0101#lolBBQ'}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 401);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 401);
        expect(response.result).to.have.property('error', 'Unauthorized');
        expect(response.result).to.have.property('message', 'Email or Password invalid');
        done();
      });
    });

    it('returns 200 HTTP status code when success login', (done) => {
      const options = {
        method: 'POST',
        url: '/user/login',
        payload: {email: 'jbauer@24hours.com', password: '#24hoursRescuePresident'}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('token');
        done();
      });
    });
  });

  describe('DELETE /user/{id}', () => {
    let userInfo;
    let token;
    before((done) => {
      db.User.truncate({})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {
            firstName: 'Jack',
            lastName: 'Bauer',
            username: 'jack_b',
            email: 'jbauer@24hours.com',
            roles: 'admin',
            password: '#24hoursRescuePresident'
          }
        };

        server.inject(options, (response) => {
          token = response.result.token;
          userInfo = jwt.verify(token, SECRET);
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      const options = {
        method: 'DELETE',
        url: '/user',
        headers: {'Authorization': 'Bearer ' + token}
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
        url: '/user/' + userInfo.id,
        headers: {'Authorization': 'Bearer ' + token}
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
