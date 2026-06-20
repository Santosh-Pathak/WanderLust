output "aws_region" {
  description = "AWS region where resources are deployed"
  value       = var.aws_region
}

output "ec2_instance_id" {
  description = "Jenkins master EC2 instance ID"
  value       = aws_instance.testinstance.id
}

output "ec2_public_ip" {
  description = "Jenkins master EC2 public IP"
  value       = aws_instance.testinstance.public_ip
}

output "ec2_public_dns" {
  description = "Jenkins master EC2 public DNS"
  value       = aws_instance.testinstance.public_dns
}

output "security_group_id" {
  description = "Security group attached to EC2 and EKS worker nodes"
  value       = aws_security_group.allow_user_to_connect.id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_arn" {
  description = "EKS cluster ARN"
  value       = module.eks.cluster_arn
}

output "eks_cluster_endpoint" {
  description = "EKS cluster API server endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_version" {
  description = "EKS cluster Kubernetes version"
  value       = module.eks.cluster_version
}

output "eks_cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster control plane"
  value       = module.eks.cluster_security_group_id
}

output "eks_oidc_provider_arn" {
  description = "IAM OIDC provider ARN (used by ArgoCD and IRSA workloads)"
  value       = module.eks.oidc_provider_arn
}

output "eks_node_group_autoscaling_group_names" {
  description = "EKS managed node group autoscaling group names"
  value       = module.eks.eks_managed_node_groups_autoscaling_group_names
}

output "configure_kubectl" {
  description = "Command to configure kubectl for the EKS cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "argocd_cluster_context_hint" {
  description = "Example ArgoCD cluster add command (run after kubectl is configured)"
  value       = "argocd cluster add ${module.eks.cluster_name} --name ${var.cluster_name}-eks-cluster"
}
