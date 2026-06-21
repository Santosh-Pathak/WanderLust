# Wanderlust EKS Monitoring (Prometheus + Grafana)

Helm values for [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack).

## Install

Run from the repository root (kubectl must target your EKS cluster):

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

kubectl create namespace prometheus

helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  --namespace prometheus \
  --values helm/monitoring/values.yaml \
  --wait \
  --timeout 10m
```

Verify pods:

```bash
kubectl get pods -n prometheus
kubectl get svc -n prometheus
```

## Access (NodePort)

Values pre-configure NodePort services for the demo EKS setup (security group already allows `30000–32767`):

| Service    | URL                                      | NodePort |
|------------|------------------------------------------|----------|
| Grafana    | `http://<eks-worker-public-ip>:32000`    | 32000    |
| Prometheus | `http://<eks-worker-public-ip>:32090`    | 32090    |

Grafana login:

- **Username:** `admin`
- **Password:**

```bash
kubectl get secret monitoring-grafana -n prometheus \
  -o jsonpath="{.data.admin-password}" | base64 --decode; echo
```

## Upgrade / uninstall

```bash
# Apply changed values
helm upgrade monitoring prometheus-community/kube-prometheus-stack \
  -n prometheus -f helm/monitoring/values.yaml

# Remove stack
helm uninstall monitoring -n prometheus
kubectl delete namespace prometheus
```

## What is monitored

With default values you get dashboards and alerts for:

- Kubernetes cluster health (API server, nodes, pods)
- Node CPU / memory / disk (node-exporter)
- Workload resources (kube-state-metrics)
- CoreDNS and kube-proxy

## Optional: scrape Wanderlust app metrics

If you add a `/metrics` endpoint to the backend and name the Service port `http`, create `helm/monitoring/values-apps.yaml`:

```yaml
additionalServiceMonitors:
  - name: wanderlust-backend
    namespaceSelector:
      matchNames:
        - wanderlust
    selector:
      matchLabels:
        app: backend
    endpoints:
      - port: http
        path: /metrics
        interval: 30s
```

Install with both value files:

```bash
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  -n prometheus \
  -f helm/monitoring/values.yaml \
  -f helm/monitoring/values-apps.yaml
```

## Resource sizing

`values.yaml` targets a small EKS cluster (2× `t2.large` nodes). For production, increase Prometheus retention, enable Grafana persistence, and tighten NodePort exposure (use Ingress + TLS instead of public NodePorts).
