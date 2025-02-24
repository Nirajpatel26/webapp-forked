#!/bin/bash


echo "-------Installing Required Packages-------"
sudo apt-get install -y mysql-server unzip nodejs npm

echo "-------Starting MySQL Service and Creating Database-------"
sudo systemctl start mysql
sudo systemctl enable mysql

echo "-------Creating Database-------"
echo "++++++++++++CHECK WHAT IS THE DATABASE NAME?: $DB_DATABASE"
sudo mysql -u root -e "CREATE database IF NOT EXISTS ${DB_DATABASE};"

echo "-------Securing MySQL Installation and Granting Permissions-------"
sudo mysql -e "CREATE USER IF NOT EXISTS '${DB_EC2_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
echo ""++++++++++++CHECK WHAT IS THE USERNAME NAME?: $DB_EC2_USER"
echo ""++++++++++++CHECK WHAT IS THE PASSWORD NAME?: $DB_PASSWORD"
sudo mysql -e "GRANT ALL PRIVILEGES ON *.* TO '${DB_EC2_USER}'@'localhost' WITH GRANT OPTION;"
sudo mysql -e "FLUSH PRIVILEGES;"