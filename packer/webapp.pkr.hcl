packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0, < 2.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

# AWS Region
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "subnet_id" {
  type    = string
  default = "subnet-0c8439b24f01cffd3"
}

variable "security_group_id" {
  type    = string
  default = "sg-0fa5cd4a07163d116"
}

variable "demo_user" {
  description = "demo user ID"
  type        = string
  default     = "307946678962"
}

variable "dev_user" {
  description = "dev user ID"
  type        = string
  default     = "307946678962"
}

# Ubuntu 24.04 LTS AMI ID
variable "source_ami" {
  type    = string
  default = "ami-04b4f1a9cf54c11d0"
}

# SSH username for the EC2 instance
variable "ssh_username" {
  type    = string
  default = "ubuntu"
}


# Instance Type
variable "instance_type" {
  type    = string
  default = "t2.micro"
}

# Volume Size
variable "volume_size" {
  type    = number
  default = 25
}

variable "DB_EC2_USER" {
  type      = string
  sensitive = true
  default   = "user"
}

variable "db_password" {
  type      = string
  sensitive = true
  default   = "password"
}

variable "db_database" {
  type      = string
  sensitive = true
  default   = "database"
}


variable "server_port" {
  type      = string
  sensitive = true
  default   = "3000"
}

variable "db_host" {
  type      = string
  sensitive = true
  default   = "localhost"
}


source "amazon-ebs" "my-ami" {
  region            = var.aws_region
  ami_name          = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description   = "AMI for A04"
  ami_regions       = ["us-east-1"]
  ami_users         = [var.demo_user]
  subnet_id         = var.subnet_id
  security_group_id = var.security_group_id

  instance_type = "t2.micro"
  source_ami    = var.source_ami
  ssh_interface = "public_ip" # Ensures SSH via public IP
  ssh_username  = var.ssh_username



  # EBS volume settings
  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/sda1"
    volume_size           = 25
    volume_type           = "gp2"
  }
}

build {
  sources = [
    "source.amazon-ebs.my-ami",
  ]

  provisioner "file" {
    source      = "../webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    script = "scripts/sh1.sh"
  }

  provisioner "shell" {
    script = "scripts/sh2.sh"
    environment_vars = [
      "DB_USERNAME=${var.DB_EC2_USER}",
      "DB_PASSWORD=${var.db_password}",
      "DB_DATABASE=${var.db_database}"
    ]
  }

  provisioner "shell" {
    script = "scripts/sh3.sh"
  }

  provisioner "shell" {
    environment_vars = [
      "DB_USERNAME=${var.DB_EC2_USER}",
      "DB_PASSWORD=${var.db_password}",
      "DB_DATABASE=${var.db_database}",
      "SERVER_PORT=${var.server_port}",
      "DB_HOST=${var.db_host}"
    ]
    script = "scripts/sh4.sh"
  }

  provisioner "shell" {
    script = "scripts/sh5.sh"
  }
}
