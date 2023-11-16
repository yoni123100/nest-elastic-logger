<h1 align="center">Nest Elastic Logger ( BetterLogger )</h1>

<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

### Introducing nest-elastic-logger, a logging library developed to reformat default Nest logger logs and generate rotating log files for integration with log shippers (like Filebeat).

### Designed to enhance logging capabilities for improved readability and efficient log management.

## Useful for:

- Easier log readably
- Log shippers ( Tested on Filebeat )
- Monitoring logs

## Features

- Comes with Elasticsearch and JSON format out of the box
- Automatic rotation of Log files
- Custom print format

## Installation:

```sh
npm i elastic-nest-logger
```

## Setup

`main.ts`

```ts
export const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const customLogger = app.get(BetterLoggerService);

  app.useLogger(customLogger); // Use as global logger
  await app.listen(3000);
};
```

`app.module.ts`

```ts
import { Module } from '@nestjs/common';
import { BetterLoggerModule } from 'nest-elastic-logger';
import { AppController } from './app.controller';

@Module({
  imports: [BetterLoggerModule.forRoot({ serviceName: 'ServiceName', serviceVersion: '1.0.0' })],
  providers: [],
  controllers: [AppController],
})
export class AppModule {}
```

## Usage

Prints "Hello There" log after 1 second
`app.controller.ts`

```ts
import { Controller, OnModuleInit } from '@nestjs/common';
import { BetterLoggerService } from 'nest-elastic-logger';

@Controller()
export class AppController implements OnModuleInit {
  private logger: BetterLoggerService = new BetterLoggerService('AppController'); // AppContoller context

  onModuleInit() {
    this.logger.log(
      'Hello There', // Message
      'onModuleInit', // Function Name
      { counter: 5, test: 'Hi' }, // Optional Args
      'extra data', // Optional Args // Optional Args
      'another extra data', // Optional Args
      { device: 'Cool Device' }, // Optional Args
    );
  }
}
```

### output

```js
[WhatupBackend v1.0.0] [15-11-2023 05:03:17] - [AppController] - [onModuleInit] - INFO - Hello There
Addional Details:
counter: 5
test: Hi
misc: extra data,another extra data
device: Cool Device
```

### BetterLoggerSettings Type

| Property            | Type                       |
| ------------------- | -------------------------- |
| serviceName         | string                     |
| serviceVersion      | string                     |
| removeNewlineFormat | boolean                    |
| printFormat         | winston.Logform.Format     |
| dailyRotateOptions  | LimitedDailyRoatateOptions |

### LimitedDailyRoatateOptions Type

| Property | Type   |
| -------- | ------ |
| maxSize  | string |
| maxFiles | string |

### Available Functions (BetterLoggerService)

| Function | Type   | Log Level |
| -------- | ------ | --------- |
| log      | string | INFO      |
| warn     | string | WARN      |
| error    | string | ERROR     |
| debug    | string | DEBUG     |
