# ---------------------------------------------------------------------------
# Terraform input variables — override via terraform.tfvars or CLI (-var)
# ---------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region for all resources "
  type        = string
  default     = "us-east-2"
}

variable "cluster_name" {
  description = "EKS cluster name and prefix for related resources"
  type        = string
  default     = "wanderlust"
}

variable "cluster_version" {
  description = "EKS Kubernetes version"
  type        = string
  default     = "1.30"
}

variable "eks_node_instance_type" {
  description = "Instance type for EKS managed node group"
  type        = string
  default     = "t2.large"
}

variable "eks_node_desired_size" {
  description = "Desired number of EKS worker nodes"
  type        = number
  default     = 2
}

variable "eks_node_min_size" {
  description = "Minimum number of EKS worker nodes"
  type        = number
  default     = 2
}

variable "eks_node_max_size" {
  description = "Maximum number of EKS worker nodes"
  type        = number
  default     = 2
}

variable "eks_node_disk_size" {
  description = "Root volume size (GB) for EKS worker nodes"
  type        = number
  default     = 29
}

variable "ami_id" {
  description = "Ubuntu AMI ID for Jenkins EC2 instances in your region"
  type        = string
  default     = "ami-085f9c64a9b75eed5" # Ubuntu 22.04 us-east-2 
}

variable "instance_type" {
  description = "EC2 instance type for Jenkins master and worker"
  type        = string
  default     = "t2.large"
}

variable "ec2_root_volume_gb" {
  description = "Root disk size (GB) for Jenkins EC2 instances"
  type        = number
  default     = 29
}
