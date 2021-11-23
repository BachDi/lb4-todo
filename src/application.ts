import {AuthenticationComponent} from '@loopback/authentication';
import {SECURITY_SCHEME_SPEC} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {CronComponent} from '@loopback/cron';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import dotenv from 'dotenv';
import path from 'path';
import * as CronJobs from './cronjobs';
import {MySequence} from './sequence';
import {MyJWTAuthenticationComponent} from './services/jwt-authentication';

dotenv.config();

export {ApplicationConfig};

export class TodoWebApi extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Bind migration component related elements
    this.component(AuthenticationComponent);
    this.component(MyJWTAuthenticationComponent);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    Object.entries(CronJobs).forEach(([_key, value]) => {
      const cronJob = value;
      this.add(cronJob);
    });

    this.addSecuritySpec();

    this.component(CronComponent);
  }

  addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'TODO API',
        version: '1.0.0',
      },
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      security: [{jwt: []}],
      servers: [{url: '/'}],
    });
  }
}
