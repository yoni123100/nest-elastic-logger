import { DynamicModule, Module, Provider } from '@nestjs/common';
import { BETTER_LOGGER_SETTINGS, BetterLogger, BetterLoggerAsyncOptions, BetterLoggerSettings } from './better-logger';
import { BetterLoggerService } from './nestjs-better-logger.service';

@Module({})
export class BetterLoggerModule {
  static forRoot(settings: BetterLoggerSettings): DynamicModule {
    return {
      module: BetterLoggerModule,
      providers: [
        BetterLogger,
        {
          provide: BETTER_LOGGER_SETTINGS,
          useValue: settings,
        },
        {
          provide: BetterLoggerService,
          useFactory: (settings: BetterLoggerSettings) => {
            const service = new BetterLoggerService();
            service.setLogger(settings);

            return service;
          },
          inject: [BETTER_LOGGER_SETTINGS],
        },
      ],
      exports: [BetterLogger, BetterLoggerService],
    };
  }

  static forRootAsync(options: BetterLoggerAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: BetterLoggerModule,
      imports: options.imports || [],
      providers: [
        ...asyncProviders,
        BetterLogger,
        {
          provide: BetterLoggerService,
          useFactory: (settings: BetterLoggerSettings) => {
            const service = new BetterLoggerService();
            service.setLogger(settings);
            return service;
          },
          inject: [BETTER_LOGGER_SETTINGS],
        },
      ],
      exports: [BetterLogger, BetterLoggerService],
    };
  }

  private static createAsyncProviders(
    options: BetterLoggerAsyncOptions
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: BETTER_LOGGER_SETTINGS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    } else if (options.useClass) {
      return [
        {
          provide: BETTER_LOGGER_SETTINGS,
          useClass: options.useClass,
        },
      ];
    } else if (options.useExisting) {
      return [
        {
          provide: BETTER_LOGGER_SETTINGS,
          useExisting: options.useExisting,
        },
      ];
    }

    throw new Error(
      "Invalid async options: either useFactory, useClass, or useExisting must be provided."
    );
  }
}
