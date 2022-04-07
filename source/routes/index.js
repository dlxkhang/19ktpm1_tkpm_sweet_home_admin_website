const homeRouter = require('./home');
const propertyRouter = require('./property');
const loginRouter = require('./login');
const logoutRouter = require('./logout');

function route(app){
  app.use('/logout',logoutRouter);
  app.use('/login',loginRouter);
  app.use('/property', propertyRouter);
  app.use('/',homeRouter);
}

module.exports = route;

