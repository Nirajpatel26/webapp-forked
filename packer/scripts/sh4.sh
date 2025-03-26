#!/bin/bash
echo "-------Installing Node.js and npm-------"

sudo apt-get install -y nodejs
sudo apt-get install -y npm

# Step 8: Install necessary Node.js packages for the project
echo "-------Installing Node.js project dependencies-------"

cd /opt/csye6225 || exit 1

sudo npm install
echo "------- installing dotenv-------"
sudo npm install dotenv
# sudo Node app.js
echo "-------COMPLETE-------"
# node app.js

cd /opt/csye6225

# Create .env file with secrets
echo "-------Creating .env file-------"
sudo bash -c "cat << EOF > /opt/csye6225/.env
SERVER_PORT=${SERVER_PORT}
DB_HOST=${DB_HOST}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=${DB_DATABASE}
EOF"

sudo chown -R csye6225:csye6225 /opt/csye6225
sudo chmod 755 /opt/csye6225/


sudo chown csye6225:csye6225 /opt/csye6225/.env
sudo chmod 755 /opt/csye6225/.env








