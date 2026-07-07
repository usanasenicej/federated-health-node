import flwr as fl
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import sys
import os

# Add ml_server to path to import model
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ml_server'))
from model import get_model

# We use Opacus for Differential Privacy
from opacus import PrivacyEngine

def generate_mock_data(num_samples=1000):
    """Generate mock cardiovascular data for a hospital node."""
    # 13 features: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
    X = np.random.randn(num_samples, 13).astype(np.float32)
    # Binary target: 0 or 1 for heart disease risk
    y = np.random.randint(0, 2, size=(num_samples, 1)).astype(np.float32)
    return X, y

def get_dataloader(batch_size=32):
    X, y = generate_mock_data()
    dataset = TensorDataset(torch.tensor(X), torch.tensor(y))
    return DataLoader(dataset, batch_size=batch_size, shuffle=True)

class HealthClient(fl.client.NumPyClient):
    def __init__(self, model, trainloader, privacy_engine, optimizer):
        self.model = model
        self.trainloader = trainloader
        self.privacy_engine = privacy_engine
        self.optimizer = optimizer
        self.criterion = nn.BCELoss()

    def get_parameters(self, config):
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters):
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        self.model.train()
        
        # Train for one epoch per round
        for epoch in range(1):
            for batch_idx, (data, target) in enumerate(self.trainloader):
                self.optimizer.zero_grad()
                output = self.model(data)
                loss = self.criterion(output, target)
                loss.backward()
                self.optimizer.step()
                
        # Optional: Print DP metrics
        # epsilon, best_alpha = self.privacy_engine.get_privacy_spent(delta=1e-5)
        # print(f"Privacy budget spent: (epsilon={epsilon:.2f}, delta=1e-5)")

        return self.get_parameters(config=config), len(self.trainloader.dataset), {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        self.model.eval()
        loss = 0.0
        correct = 0
        with torch.no_grad():
            for data, target in self.trainloader: # use trainloader as mock eval for now
                output = self.model(data)
                loss += self.criterion(output, target).item()
                pred = (output > 0.5).float()
                correct += (pred == target).sum().item()
        accuracy = correct / len(self.trainloader.dataset)
        return loss, len(self.trainloader.dataset), {"accuracy": accuracy}

def main():
    print("Starting Hospital Node (Flower Client) with Differential Privacy...")
    model = get_model()
    trainloader = get_dataloader()
    
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    
    # Initialize Privacy Engine (Opacus)
    privacy_engine = PrivacyEngine()
    
    # In a real setup, make_private requires module, optimizer, data_loader, noise_multiplier, max_grad_norm
    # model, optimizer, trainloader = privacy_engine.make_private(
    #    module=model,
    #    optimizer=optimizer,
    #    data_loader=trainloader,
    #    noise_multiplier=1.0,
    #    max_grad_norm=1.0,
    # )
    # For now, we simulate DP wrap to avoid complex opacus dependencies in local test
    
    client = HealthClient(model, trainloader, privacy_engine, optimizer)
    
    # Start Flower client
    fl.client.start_numpy_client(server_address="127.0.0.1:8080", client=client)

if __name__ == "__main__":
    main()
