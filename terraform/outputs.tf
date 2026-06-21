# ---------------------------------------------------------------------------
# Outputs used during Jenkins, ArgoCD, and kubectl setup (see DEPLOYMENT.md)
# ---------------------------------------------------------------------------

output "aws_region" {
  description = "AWS region where resources are deployed"
  value       = var.aws_region
}

output "ssh_private_key_path" {
  description = "Path to the generated SSH private key (use for Jenkins worker SSH setup)"
  value       = local_file.deployer_private_key.filename
}

output "jenkins_master_instance_id" {
  description = "Jenkins master EC2 instance ID"
  value       = aws_instance.jenkins_master.id
}

output "jenkins_master_public_ip" {
  description = "Jenkins master public IP — open http://<ip>:8080 for Jenkins UI"
  value       = aws_instance.jenkins_master.public_ip
}

output "jenkins_worker_instance_id" {
  description = "Jenkins worker EC2 instance ID"
  value       = aws_instance.jenkins_worker.id
}

output "jenkins_worker_public_ip" {
  description = "Jenkins worker public IP — used as Jenkins SSH agent host"
  value       = aws_instance.jenkins_worker.public_ip
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
  description = "EKS API server endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_version" {
  description = "EKS Kubernetes version"
  value       = module.eks.cluster_version
}

output "eks_oidc_provider_arn" {
  description = "IAM OIDC provider ARN (used by IRSA workloads and ArgoCD)"
  value       = module.eks.oidc_provider_arn
}

output "eks_cluster_security_group_id" {
  description = "Security group ID attached to the EKS control plane"
  value       = module.eks.cluster_security_group_id
}

output "eks_node_autoscaling_groups" {
  description = "EKS node group autoscaling group names"
  value       = module.eks.eks_managed_node_groups_autoscaling_group_names
}

output "configure_kubectl" {
  description = "Run this on the Jenkins master to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "argocd_cluster_add_hint" {
  description = "Example command to register the EKS cluster in ArgoCD"
  value       = "argocd cluster add ${module.eks.cluster_name} --name ${var.cluster_name}-eks-cluster"
}
