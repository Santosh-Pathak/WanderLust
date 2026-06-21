# ---------------------------------------------------------------------------
# SSH key pair for EC2 (Jenkins nodes) and EKS worker SSH access
# Terraform generates the key locally under .generated/ — no manual key file needed
# ---------------------------------------------------------------------------

resource "tls_private_key" "deployer" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "deployer" {
  key_name   = "${var.cluster_name}-deployer-key"
  public_key = tls_private_key.deployer.public_key_openssh

  tags = {
    Name      = "${var.cluster_name}-deployer-key"
    ManagedBy = "terraform"
  }
}

resource "local_file" "deployer_private_key" {
  content         = tls_private_key.deployer.private_key_pem
  filename        = "${path.module}/.generated/${var.cluster_name}-deployer.pem"
  file_permission = "0600"
}
