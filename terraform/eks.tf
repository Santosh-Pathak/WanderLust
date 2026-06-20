data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [aws_default_vpc.default.id]
  }
}

# EKS cluster and node group — mirrors README eksctl setup:
#   cluster: wanderlust, Kubernetes 1.30, t2.large nodes (2/2/2), 29 GB disk, SSH access
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.24"

  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version

  vpc_id     = aws_default_vpc.default.id
  subnet_ids = data.aws_subnets.default.ids

  cluster_endpoint_public_access = true

  enable_cluster_creator_admin_permissions = true
  enable_irsa                              = true

  cluster_addons = {
    vpc-cni = {
      most_recent = true
    }
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
  }

  eks_managed_node_groups = {
    wanderlust = {
      name           = var.cluster_name
      instance_types = [var.eks_node_instance_type]
      min_size       = var.eks_node_min_size
      max_size       = var.eks_node_max_size
      desired_size   = var.eks_node_desired_size
      disk_size      = var.eks_node_disk_size
      key_name       = aws_key_pair.deployer.key_name

      vpc_security_group_ids = [aws_security_group.allow_user_to_connect.id]

      remote_access = {
        ec2_ssh_key = aws_key_pair.deployer.key_name
      }

      labels = {
        role = "worker"
      }

      tags = {
        Name = "${var.cluster_name}-node"
      }
    }
  }

  tags = {
    Name        = var.cluster_name
    Environment = "wanderlust-mega-project"
    ManagedBy   = "terraform"
  }
}
