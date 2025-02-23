#!/bin/bash
echo "-------Installing Node.js and npm-------"
# curl -fsSL https://deb.nodesource.com/setup_12.x | sudo -E bash -/
sudo apt-get install -y nodejs
sudo apt-get install -y npm

# Step 8: Install necessary Node.js packages for the project
echo "-------Installing Node.js project dependencies-------"
sudo chown -R ubuntu:ubuntu /opt/csye6225
cd /opt/csye6225 || exit 1
# npm install bcrypt sequelize pg pg-hstore
# npm install sequelize-cli --save-dev
# npm install 
# In your build script
sudo npm install 
echo "------- installing dotenv-------"
sudo npm install dotenv
# sudo Node app.js
echo "-------COMPLETE-------"
# node app.js