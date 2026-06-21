#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Updates backend/.env.docker with the EKS worker public IP for NodePort access.
# Run from Jenkins CI on the worker node (requires AWS CLI + IAM permissions).
#
# BEFORE FIRST RUN:
#   1. Get an EKS worker instance ID: aws ec2 describe-instances --filters "Name=tag:eks:nodegroup-name,Values=wanderlust"
#   2. Set INSTANCE_ID below to that value (see DEPLOYMENT.md Step 8)
# -----------------------------------------------------------------------------

set -euo pipefail

INSTANCE_ID="${EKS_WORKER_INSTANCE_ID:-i-REPLACE_WITH_EKS_WORKER_INSTANCE_ID}"
ENV_FILE="../backend/.env.docker"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ipv4_address=$(aws ec2 describe-instances \
  --instance-ids "${INSTANCE_ID}" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

if [[ -z "${ipv4_address}" || "${ipv4_address}" == "None" ]]; then
  echo -e "${RED}ERROR: Could not resolve public IP for instance ${INSTANCE_ID}${NC}"
  exit 1
fi

echo -e "${GREEN}EKS worker public IP${NC}: ${ipv4_address}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo -e "${RED}ERROR: ${ENV_FILE} not found${NC}"
  exit 1
fi

expected_frontend_url="FRONTEND_URL=\"http://${ipv4_address}:31000\""

if grep -qF "${expected_frontend_url}" "${ENV_FILE}"; then
  echo -e "${YELLOW}${ENV_FILE} already points at ${ipv4_address}${NC}"
  exit 0
fi

echo -e "${YELLOW}Updating ${ENV_FILE} with NodePort frontend URL${NC}"
sed -i -E "s|^FRONTEND_URL=.*|${expected_frontend_url}|g" "${ENV_FILE}"
echo -e "${GREEN}Backend env configured.${NC}"
