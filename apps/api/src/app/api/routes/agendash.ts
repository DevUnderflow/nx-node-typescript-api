import { Router } from 'express';
import basicAuth from 'express-basic-auth';
import agendash from 'agendash';
import { Container } from 'typedi';
import { environment } from '../../../environments/environment';
import Agenda from 'agenda';
import middleware from '../middlewares';

export default (app: Router) => {
  const agendaInstance: Agenda = Container.get('agendaInstance');

  app.use(
    '/dash',
    basicAuth({
      users: {
        [environment.agendash.user]: environment.agendash.password,
      },
      challenge: true,
    }),
    agendash(agendaInstance),
  );

  app.use('/scheduleMail', middleware.isAuth, middleware.attachCurrentUser, async (req, res) => {
    agendaInstance.define('print', async _job => {
      console.log('I print a report!',_job);
    });
    agendaInstance.schedule('2020-08-01T10:15', 'print');
    res.send('done');
    // get Date & Time from this element <input type="datetime-local" id="birthdaytime" name="birthdaytime">
  });
};
