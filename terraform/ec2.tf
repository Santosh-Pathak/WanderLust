# ---------------------------------------------------------------------------
# Jenkins Master EC2 — hosts Jenkins, SonarQube, kubectl, eksctl, ArgoCD CLI
# Jenkins Worker EC2 — Jenkins agent with Docker and Trivy for CI builds
# ---------------------------------------------------------------------------

resource "aws_instance" "jenkins_master" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.allow_user_to_connect.id]

  root_block_device {
    volume_size = var.ec2_root_volume_gb
    volume_type = "gp3"
  }

  tags = {
    Name        = "${var.cluster_name}-jenkins-master"
    Role        = "jenkins-master"
    Environment = "wanderlust-mega-project"
    ManagedBy   = "terraform"
  }
}

resource "aws_instance" "jenkins_worker" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.allow_user_to_connect.id]
  iam_instance_profile   = aws_iam_instance_profile.jenkins_worker.name

  root_block_device {
    volume_size = var.ec2_root_volume_gb
    volume_type = "gp3"
  }

  tags = {
    Name        = "${var.cluster_name}-jenkins-worker"
    Role        = "jenkins-worker"
    Environment = "wanderlust-mega-project"
    ManagedBy   = "terraform"
  }
}

# Attach administrator IAM role to Jenkins worker (required for AWS CLI in pipeline)
resource "aws_iam_role" "jenkins_worker" {
  name = "${var.cluster_name}-jenkins-worker-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_iam_role_policy_attachment" "jenkins_worker_admin" {
  role       = aws_iam_role.jenkins_worker.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

resource "aws_iam_instance_profile" "jenkins_worker" {
  name = "${var.cluster_name}-jenkins-worker-profile"
  role = aws_iam_role.jenkins_worker.name
}
