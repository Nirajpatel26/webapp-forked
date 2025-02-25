#!/bin/bash

echo "-------Updating the system-------"
sudo apt-get update -y
sudo apt-get upgrade -y

echo "-------Checking and Creating the csye6225 group and user-------"
sudo groupadd csye6225 || echo "Group csye6225 already exists"
sudo useradd -s /sbin/nologin -M -g csye6225 csye6225 || echo "User csye6225 already exists"



echo "-------Installing Required Packages-------"
sudo apt-get install -y mysql-server

sudo apt-get install -y unzip

echo "-------Starting MySQL Service and Creating Database-------"
sudo systemctl start mysql
sudo systemctl enable mysql

echo "-------Creating Database-------"
sudo mysql -u root -e "CREATE DATABASE IF NOT EXISTS webapp_check;"

echo "-------Securing MySQL Installation and Granting Permissions-------"
sudo mysql -e "CREATE USER IF NOT EXISTS 'cyseNiraj3'@'localhost' IDENTIFIED BY 'cyse6225niraj';"
sudo mysql -e "GRANT ALL PRIVILEGES ON *.* TO 'cyseNiraj3'@'localhost' WITH GRANT OPTION;"
sudo mysql -e "FLUSH PRIVILEGES;"


echo "-------Unzipping the Application-------"
sudo mkdir -p /opt/csye6225
sudo unzip webapp.zip -d /opt/csye6225/

echo "-------Moving .env File-------"
sudo cp .env /opt/csye6225/webapp/

echo "-------Updating Permissions-------"
sudo chown -R csye6225:csye6225 /opt/csye6225/
sudo chmod -R 750 /opt/csye6225/

echo "-------Installing Node.js Project Dependencies-------"
cd /opt/csye6225/webapp || exit 1
npm install --unsafe-perm

echo "-------Starting the Application-------"
sudo -u csye6225 npm start &

