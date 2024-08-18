# StPeter

StPeter is an OAuth authentication server built with Node.js, Express, and TypeScript with postgresql as databse suport. It provides secure authentication mechanisms using JWT tokens and supports various user actions such as registration, login, password recovery, and email verification. The project is a good base for Express-based projects.

## Table of Contents

- [StPeter](#stpeter)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Enviorment variables](#enviorment-variables)
  - [Development](#development)

## Installation

```sh
    git clone https://github.com/dsl400/stpeter.git
    cd stpeter
    npm install
```

## Usage

- configure the database connection in `server/db.ts`

```sh
    npm start
```

## Enviorment variables
| Variable Name                 | Purpose                                | Default                |
| :---------------------------- | :------------------------------------- | :--------------------- |
| JWT_ISSUER                    | issuer inside the jwt token            | stpeter                |
| CONFIRM_EMAIL_ON_REGISTRATION | wether to send email confirmation link | true                   |
| SERVER_PORT                   | port that server listens on            | 3000                   |
| SITE_ADMIN_EMAIL              | site administrator mail address        | admin@stpeter.lan      |
| PASSWORD_RESET_EMAIL_SUBJECT  | subject used on password reset mail    | Password Reset Request |
| PASSWORD_RESET_URL            | link used for password reset           |                        |
| EMAIL_CONFIRMATION_SUBJECT    | subject used on mail confirmation      | Email confirmation     |
| SMTP_HOST                     | smtp server used for sending mail      | localhost              |
| SMTP_PORT                     | smtp server port                       | 2500                   |
| SMTP_SECURE                   | wether to use secure smtp              | true                   |
| SMTP_USER                     | smtp username                          |                        |
| SMTP_PASS                     | smtp password                          |                        |
| PGHOST                        | postgres host                          | localhost              |
| PGUSER                        | postgres user                          | stpeter                |
| PGPASSWD                      | postgres password                      | stpeterspassword       |
| PGDATABASE                    | postgres database                      | postgres               |
| PGPORT                        | postgres port                          | 54322                  |
| JWT_SECRET                    | jwt encryption key                     |                        |



## Development

To start the server in development mode with automatic restarts on file changes:

```sh
    npm run start:dev
```

To start a postgres docker container for testing

```sh
    docker run --name postgres-stpeter-test -e POSTGRES_USER=stpeter -e POSTGRES_PASSWORD=stpeterspassword -e POSTGRES_DB=postgres -p 54322:5432 -v $(pwd)/schema/auth.users.sql:/docker-entrypoint-initdb.d/auth.users.sql -d postgres:latest
```

To start a inbucket container for testing 

```sh
    docker run -d --name inbucket -p 9000:9000 -p 2500:2500 inbucket/inbucket
```

