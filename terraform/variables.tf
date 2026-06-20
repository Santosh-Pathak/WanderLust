variable "aws_region" {
  description = "AWS region where resources will be provisioned"
  default     = "us-east-2"
}

variable "cluster_name" {
  description = "EKS cluster name"
  default     = "wanderlust"
}

variable "cluster_version" {
  description = "EKS Kubernetes version"
  default     = "1.30"
}

variable "eks_node_instance_type" {
  description = "Instance type for EKS worker nodes"
  default     = "t2.large"
}

variable "eks_node_desired_size" {
  description = "Desired number of EKS worker nodes"
  default     = 2
}

variable "eks_node_min_size" {
  description = "Minimum number of EKS worker nodes"
  default     = 2
}

variable "eks_node_max_size" {
  description = "Maximum number of EKS worker nodes"
  default     = 2
}

variable "eks_node_disk_size" {
  description = "Root volume size (GB) for EKS worker nodes"
  default     = 29
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance"
  default     = "ami-085f9c64a9b75eed5"
}

variable "instance_type" {
  description = "Instance type for the EC2 instance"
  default     = "t2.large"
}