import { Container } from 'typedi';
import LoggerInstance from './logger';
import agendaFactory from './agenda';
import Agenda from 'agenda';
import mailer from 'nodemailer';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default ({ mongoConnection, models }: { mongoConnection; models: { name: string; model: any }[] }) => {
  try {
    models.forEach(m => {
      Container.set(m.name, m.model);
    });
    const nodeMailerTransport = mailer.createTransport({
      service: 'gmail',
      // host: process.env.MAIL_HOST,
      // port: 24,
      secure: true,
      secureConnection: true,
      tls: {
        secureProtocol: 'TLSv1_method',
      },
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_SECRET,
      },
    });
    const agendaInstance: Agenda = agendaFactory({ mongoConnection });
    Container.set('agendaInstance', agendaInstance);
    Container.set('logger', LoggerInstance);
    Container.set('NodeMailerClient', nodeMailerTransport);
    LoggerInstance.info('✌️ Agenda injected into container');

    return { agenda: agendaInstance };
  } catch (e) {
    LoggerInstance.error('🔥 Error on dependency injector loader: %o', e);
    throw e;
  }
};
