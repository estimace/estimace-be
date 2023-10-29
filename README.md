# Estimace Backend

Estimace backend is a TypeScript application that includes a REST API Server and a WebSocket Server, both of which rely on Postgres for data storage. The Rest API is implemented using `express` and the WebSocket server is using `ws` library.

## Run application in dev mode

Install the dependencies using 
```sh
yarn install
```

Create a copy of `.env.sample` file and call it `.env`
```sh
cp .env.sample .env
```

Create a development database in your local  Postgres server called `estimace-dev` and then migrate it to the latest database structure by
```sh
yarn run db:migrate:latest
```

Run the application in dev mode
```sh
yarn dev
```

## Run tests

Create a test db in your local Postgres server called `estimace_test` and add a test user to it:
```sh
$ psql
CREATE DATABASE estimace_test;
CREATE USER estimace_user WITH ENCRYPTED PASSWORD 'secret';
GRANT ALL PRIVILEGES ON DATABASE estimace_test to estimace_user;
ALTER DATABASE estimace_test OWNER TO estimace_user;
```

Then run the tests by the command below:

```sh
yarn test
```

To run the tests in dev mode while watching for file changes you can use the command below:

```sh
yarn test:watch
```