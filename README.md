# Estimace Backend
For estimating stories and tasks in your Agile team, give *Estimace* a try! It's a fast, real-time, and open-source tool that hones in on the essentials, creating a collaborative space known as a "room." Team members can easily join the room using a shared URL. Right now, Estimace offers support for two popular estimation techniques: Fibonacci and T-Shirt sizing. You can either use it for free by visiting [estimace.com](https://www.estimace.com/) or self-host it. Happy estimating! 😊

**Estimace backend** is a TypeScript application that includes a REST API Server and a WebSocket Server, both of which rely on Postgres for data storage. The Rest API is implemented using `express` and the WebSocket server is using `ws` library.

The front-end counterpart of the application can be found [here](https://gitlab.com/estimace/estimace-fe). Follow the README file in that repo to set it up.

## Installation

To get started with the project, Clone the repository to your local machine and follow these steps:

### Use NVM
to change your local node version to a compatible version with the project, install [nvm](https://github.com/nvm-sh/nvm) package and run the command below in the project directory:

```sh
nvm use
```

### Install the dependencies
  
```sh
yarn install
```

### Setup Environment Variables
  
  Create a copy of `.env.sample` file in the project root and call it `.env`

```sh
  cp .env.sample .env
```
### Initiate database
  
Create a development database in your local Postgres server called `estimace-dev` and then initiate it by running:

```sh 
yarn run db:migrate:latest
```

## Usage
To start the server in development mode with automatic restart on file changes, run the application in dev mode

```sh
yarn dev
```

To start the server in production mode:
```sh
yarn start
```

## Technologies

### Framework and Libraries

**Express:** A fast, flexible, minimalist web framework for Node.js, used for building the backend server.

**ws:** A simple-to-use WebSocket client and server implementation for Node.js, facilitating real-time communication between the server and clients.

**Knex:** A SQL query builder for Node.js, used for interacting with the database and managing migrations.

**PostgreSQL:** A powerful, reliable, open-source relational database system, used as the backend database.

**Morgan:** HTTP request logger middleware for Node.js, used for logging HTTP requests in the server.

### Development and Testing
**TypeScript:** A superset of JavaScript that adds static types to the language, used for developing the backend application.

**Jest:** A JavaScript testing framework, used for writing and running unit tests.

**Supertest:** A library for testing HTTP assertions, used for testing HTTP requests and responses.

**superwstest:** A utility for testing WebSocket connections in Jest.

**Gitlab CI**: Used gitlab continuous integration service to make the app's pipeline to ensure the app is in ready for production after each development change.

**Docker**: The app is containerized using Docker, providing consistency in deployment across various environments.


## Project Structure
The project follows the Model-Controller-View (MCV) design pattern.
- Models: Database models and business logic are organized here. Utilizes Knex for database operations.
- Controllers: Handle the incoming requests, interact with models, and send responses.
- Views: Not applicable for our backend project since it does not serve front-end content. The Front-end is a separate project available at [Estimace front-end](https://gitlab.com/estimace/estimace-fe).

## Database
Database operations in this project are handled through abstraction using `Knex`, a SQL query builder for Node.js. The `migrations` folder encapsulates migration files, each containing the logic necessary for creating tables within the database. Models, representing the structure and interactions with the database, are organized under the `models` directory located within the *src* directory. 
This separation ensures a modular and organized approach to managing database-related functionalities in the application

To create a new migration, use:
```sh
yarn db:migrate:make
```

To apply the latest migrations, use:

```sh
yarn db:migrate:latest
```

To rollback the last migration, use:

```sh
yarn db:migrate:rollback
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

## License:

Estimace Backend is distributed under the MIT License. See the `LICENSE` file for more details. Feel free to use, modify, and distribute the software in accordance with the terms of the MIT License.