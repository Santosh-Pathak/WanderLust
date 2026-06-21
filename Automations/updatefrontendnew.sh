#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Updates frontend/.env.docker with the backend NodePort URL on the EKS worker.
# Run from Jenkins CI on the worker node (requires AWS CLI + IAM permissions).
#
# BEFORE FIRST RUN:
#   1. Get an EKS worker instance ID (same value as updatebackendnew.sh)
#   2. Set INSTANCE_ID below or export EKS_WORKER_INSTANCE_ID
# -----------------------------------------------------------------------------

set -euo pipefail

INSTANCE_ID="${EKS_WORKER_INSTANCE_ID:-i-REPLACE_WITH_EKS_WORKER_INSTANCE_ID}"
ENV_FILE="../frontend/.env.docker"

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

expected_api_path="VITE_API_PATH=\"http://${ipv4_address}:31100\""

if grep -qF "${expected_api_path}" "${ENV_FILE}"; then
  echo -e "${YELLOW}${ENV_FILE} already points at ${ipv4_address}${NC}"
  exit 0
fi

echo -e "${YELLOW}Updating ${ENV_FILE} with backend NodePort API URL${NC}"
sed -i -E "s|^VITE_API_PATH=.*|${expected_api_path}|g" "${ENV_FILE}"
echo -e "${GREEN}Frontend env configured.${NC}"
