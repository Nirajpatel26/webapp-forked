# Cloud-Native Web Application

This repository contains a cloud-native web application that includes a `/healthz` endpoint for monitoring the health of the application and its connection to a MySQL database.
!


  ```bash
  APP_PORT=3000
  DB_USERNAME=your_db_username
  DB_PASSWORD=your_db_password
  DB_NAME=your_db_name
  DB_HOST=your_db_host
  DB_PORT=your_db_port
  ```

### 1. Install Dependencies

Use npm (or yarn) to install the dependencies required for the project:

```bash
npm install
```

### 2. Set Up the Database

Ensure that MySQL is installed and running on your local machine. Update the `.env` file with your database credentials.

You may need to create the database manually. For PostgreSQL:

For MySQL: "Create database healthz_webapp"

### 3. Running the Application Locally
Once everything is set up, start the application:

```bash
npm start
```