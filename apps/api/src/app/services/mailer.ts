import { Container } from 'typedi';
import { Service, Inject } from 'typedi';
import { IUser } from '../interfaces/IUser';
import { Logger } from 'winston';

@Service()
export default class MailerService {
  Logger: Logger;
  constructor(@Inject('NodeMailerClient') private nodeMailerTransport) {
    this.Logger = Container.get('logger');
  }

  public async SendWelcomeEmail(email,name) {
    this.Logger.debug(`🔥Sending Welcome mail to %o`, email);
    this.Logger.debug(`Name %o`, name);
    const data = {
      from: 'Eklavya Team <assistance.eklavya@gmail.com>',
      to: email,
      subject: `Hi from Eklavya`,
      text: 'Welcome to our commutiy',
    };

    const resp = await this.nodeMailerTransport.sendMail(data);
    if (resp.rejected != '') {
      throw new Error(`Error Sending Mail to ${resp.rejected}`);
    }

    return { delivered: 1, status: 'ok' };
  }

  public StartEmailSequence(sequence: string, user: Partial<IUser>) {
    if (!user.email) {
      throw new Error('No email provided');
    }
    // @TODO Add example of an email sequence implementation
    // Something like
    // 1 - Send first email of the sequence
    // 2 - Save the step of the sequence in database
    // 3 - Schedule job for second email in 1-3 days or whatever
    // Every sequence can have its own behavior so maybe
    // the pattern Chain of Responsibility can help here.
    return { delivered: 1, status: 'ok' };
  }
}
