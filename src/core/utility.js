'use strict';

exports.register = (server, options, next) => {
  const db = options.database;

  server.method('loadModels', loadModels);

  server.method('loadRoutes', loadRoutes);

  server.register({
    register: require('hapi-boom-decorators')
  }, (err) => {
    if (!err) {
      return next();
    }
  });

  function loadModels (models, cb) {
    models.map((m) => {
      let model = db.sequelize['import'](m);
      db[model.name] = model;
    });

    return cb(null);
  }

  function loadRoutes (routes, cb) {
    let registerRoutes = routes.map((route) => {
      return {
        register: require(route),
        options: {database: db}
      };
    });

    server.register(registerRoutes, (err) => {
      if (err) {
        cb(err);
      }

      return cb(null);
    });
  }
};

exports.register.attributes = {
  name: 'utility',
  version: '1.0.0'
};
