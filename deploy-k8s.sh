#!/bin/bash

set -e

echo "🚀 Starting Kubernetes deployment for Knowledge Bot..."

# Check if gemini-secrets exists
if ! kubectl get secret gemini-secrets > /dev/null 2>&1; then
    echo "⚠️  Warning: 'gemini-secrets' not found."
    echo "Please create it using: kubectl create secret generic gemini-secrets --from-literal=api-key=YOUR_API_KEY"
fi

# Check if microsoft-secrets exists
if ! kubectl get secret microsoft-secrets > /dev/null 2>&1; then
    echo "⚠️  Warning: 'microsoft-secrets' not found."
    echo "Please create it using: kubectl create secret generic microsoft-secrets --from-literal=client-id=YOUR_CLIENT_ID --from-literal=tenant-id=YOUR_TENANT_ID --from-literal=client-secret=YOUR_CLIENT_SECRET"
fi

echo "📦 Building Backend Image..."
cd backend
docker build -t knowledge-bot-backend:v1.0.0 .
docker save knowledge-bot-backend:v1.0.0 | ctr -n k8s.io images import -
cd ..

echo "📦 Building Frontend Image..."
cd frontend
docker build -t knowledge-bot-frontend:v1.0.0 .
docker save knowledge-bot-frontend:v1.0.0 | ctr -n k8s.io images import -
cd ..

echo "☸️  Applying Kubernetes Manifests..."
# Ensure deployment.yaml uses the v1.0.0 images
sed -i 's/knowledge-bot-backend:latest/knowledge-bot-backend:v1.0.0/g' k8s/deployment.yaml
sed -i 's/knowledge-bot-frontend:latest/knowledge-bot-frontend:v1.0.0/g' k8s/deployment.yaml
kubectl apply -f k8s/deployment.yaml

echo "✅ Deployment complete!"
echo "UI should be accessible on port 8080 (Service port) or 30080 (NodePort)."
echo "API should be accessible on port 8081."
echo "Use 'kubectl get pods' to check status."
