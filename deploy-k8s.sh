#!/bin/bash

set -e

echo "🚀 Starting Kubernetes deployment for Knowledge Bot (Optimized)..."

# Check if microsoft-secrets exists
if ! kubectl get secret microsoft-secrets > /dev/null 2>&1; then
    echo "⚠️  Warning: 'microsoft-secrets' not found."
    echo "Please create it using: kubectl create secret generic microsoft-secrets --from-literal=client-id=YOUR_CLIENT_ID --from-literal=tenant-id=YOUR_TENANT_ID --from-literal=client-secret=YOUR_CLIENT_SECRET"
fi

# Check if openrouter-secrets exists
if ! kubectl get secret openrouter-secrets > /dev/null 2>&1; then
    echo "⚠️  Warning: 'openrouter-secrets' not found."
    echo "Please create it using: kubectl create secret generic openrouter-secrets --from-literal=api-key=YOUR_API_KEY --from-literal=model-id=amazon/nova-pro-v1"
fi

echo "📦 Building Backend Image..."
cd backend
docker build -t knowledge-bot-backend:v1.0.8 .
docker save knowledge-bot-backend:v1.0.8 | ctr -n k8s.io images import -
cd ..

echo "📦 Building Frontend Image..."
cd frontend
docker build -t knowledge-bot-frontend:v1.0.8 .
docker save knowledge-bot-frontend:v1.0.8 | ctr -n k8s.io images import -
cd ..

echo "☸️  Applying Kubernetes Manifests..."
# Ensure deployment.yaml uses the v1.0.8 images
sed -i 's/knowledge-bot-backend:v1.0.5/knowledge-bot-backend:v1.0.8/g' k8s/deployment.yaml
sed -i 's/knowledge-bot-frontend:v1.0.5/knowledge-bot-frontend:v1.0.8/g' k8s/deployment.yaml
kubectl apply -f k8s/deployment.yaml

echo "✅ Deployment complete!"
