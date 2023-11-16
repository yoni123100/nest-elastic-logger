import { DynamicModule, Module } from '@nestjs/common';
import { BetterLogger, BetterLoggerSettings } from './better-logger';
import { BetterLoggerService } from './nestjs-better-logger.service';

@Module({})
export class BetterLoggerModule {
  static forRoot(settings: BetterLoggerSettings): DynamicModule {
    return {
      module: BetterLoggerModule,
      providers: [
        BetterLogger,
        {
          provide: BetterLoggerService,
          useFactory: () => {
            const service = new BetterLoggerService();
            service.setLogger(settings);

            return service;
          },
        },
      ],
      exports: [BetterLogger, BetterLoggerService],
    };
  }
}
