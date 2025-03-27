#!/bin/bash
echo "-------Installing CloudWatch agent-------"
curl https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb -O
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

sudo apt-get clean

echo "-------Creating CloudWatch agent configuration-------"
sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc/

cat <<EOF | sudo tee /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
{
  "agent": {
    "metrics_collection_interval": 10,
    "logfile": "/var/log/amazon-cloudwatch-agent.log"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/webapp.log",
            "log_group_name": "/csye6225/webapp",
            "log_stream_name": "webappLogStream",
            "timestamp_format": "%Y-%m-%d %H:%M:%S",
            "log_format": "json"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "webapp",
    "metrics_collected": {
      "statsd": {
        "service_address": ":8125",
        "metrics_collection_interval": 15,
        "metrics_aggregation_interval": 300
      }
    }
  }
}
EOF

echo "-------Setting permissions for CloudWatch agent configuration-------"
sudo chown root:root /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
sudo chmod 644 /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

# Start CloudWatch agent
echo "-------Starting CloudWatch agent-------"
sudo systemctl enable amazon-cloudwatch-agent
sudo systemctl start amazon-cloudwatch-agent