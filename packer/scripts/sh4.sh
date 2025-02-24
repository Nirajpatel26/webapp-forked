#!/bin/bash
echo "-------Installing Node.js and npm-------"

sudo apt-get install -y nodejs
sudo apt-get install -y npm

# Step 8: Install necessary Node.js packages for the project
echo "-------Installing Node.js project dependencies-------"
sudo chown -R ubuntu:ubuntu /opt/csye6225
cd /opt/csye6225 || exit 1

sudo npm install 
echo "------- installing dotenv-------"
sudo npm install dotenv
# sudo Node app.js
echo "-------COMPLETE-------"
# node app.js