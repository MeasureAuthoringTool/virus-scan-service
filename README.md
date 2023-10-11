# virus-scan-service

## Description
This is a virus scanning microservice based on the on [NestJS](https://github.com/nestjs/nest) framework.
## Pre-requisite
### ClamAv installation

https://www.jdeen.com/blog/install-configure-clamav-macos-linux-free-antivirus-solution

```brew install clamav```
```sudo brew services start clamav```

### Docker
```docker compose up```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [CC0 licensed](LICENSE).
