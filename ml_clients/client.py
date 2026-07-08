import flwr as fl
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import sys
import os
import logging

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("healthledger.client")

# Add ml_server to path to import model
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "ml_server"))
from model import get_model

from opacus import PrivacyEngine

# ---------------------------------------------------------------------------
# Config (overridable via env vars)
# ---------------------------------------------------------------------------
SERVER_ADDRESS = os.getenv("FL_SERVER_ADDRESS", "127.0.0.1:8080")
LOCAL_EPOCHS = int(os.getenv("FL_LOCAL_EPOCHS", "1"))
BATCH_SIZE = int(os.getenv("FL_BATCH_SIZE", "32"))
LEARNING_RATE = float(os.getenv("FL_LEARNING_RATE", "0.01"))
NUM_SAMPLES = int(os.getenv("FL_NUM_SAMPLES", "1000"))
NOISE_MULTIPLIER = float(os.getenv("FL_NOISE_MULTIPLIER", "1.0"))
MAX_GRAD_NORM = float(os.getenv("FL_MAX_GRAD_NORM", "1.0"))
DELTA = float(os.getenv("FL_DELTA", "1e-5"))


# ---------------------------------------------------------------------------
# Data helpers
# ---------------------------------------------------------------------------
def generate_mock_data(num_samples: int = NUM_SAMPLES):
    """Generate mock cardiovascular data for a hospital node.

    Features (13):
        age, sex, cp, trestbps, chol, fbs, restecg,
        thalach, exang, oldpeak, slope, ca, thal
    """
    X = np.random.randn(num_samples, 13).astype(np.float32)
    y = np.random.randint(0, 2, size=(num_samples, 1)).astype(np.float32)
    return X, y


def get_dataloader(batch_size: int = BATCH_SIZE) -> DataLoader:
    X, y = generate_mock_data()
    dataset = TensorDataset(torch.tensor(X), torch.tensor(y))
    return DataLoader(dataset, batch_size=batch_size, shuffle=True)


# ---------------------------------------------------------------------------
# Flower client
# ---------------------------------------------------------------------------
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

        for epoch in range(LOCAL_EPOCHS):
            epoch_loss = 0.0
            for data, target in self.trainloader:
                self.optimizer.zero_grad()
                output = self.model(data)
                loss = self.criterion(output, target)
                loss.backward()
                self.optimizer.step()
                epoch_loss += loss.item()
            logger.info("  Epoch %d — loss: %.4f", epoch + 1, epoch_loss / len(self.trainloader))

        # Report privacy budget consumed this round
        epsilon = self.privacy_engine.get_epsilon(delta=DELTA)
        logger.info("  Privacy budget spent → ε = %.2f (δ = %g)", epsilon, DELTA)

        return self.get_parameters(config=config), len(self.trainloader.dataset), {"epsilon": epsilon}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        self.model.eval()
        loss = 0.0
        correct = 0
        with torch.no_grad():
            for data, target in self.trainloader:
                output = self.model(data)
                loss += self.criterion(output, target).item()
                pred = (output > 0.5).float()
                correct += (pred == target).sum().item()
        accuracy = correct / len(self.trainloader.dataset)
        logger.info("  Evaluation — loss: %.4f  accuracy: %.4f", loss, accuracy)
        return loss, len(self.trainloader.dataset), {"accuracy": accuracy}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main():
    logger.info("Starting Hospital Node (Flower Client) with Differential Privacy")
    logger.info("  Server     : %s", SERVER_ADDRESS)
    logger.info("  Epochs/rnd : %d  |  Batch: %d  |  LR: %g", LOCAL_EPOCHS, BATCH_SIZE, LEARNING_RATE)
    logger.info("  DP noise   : %.2f  |  max_grad_norm: %.2f", NOISE_MULTIPLIER, MAX_GRAD_NORM)

    model = get_model()
    trainloader = get_dataloader()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)

    # Wire up Opacus differential-privacy engine
    privacy_engine = PrivacyEngine()
    model, optimizer, trainloader = privacy_engine.make_private(
        module=model,
        optimizer=optimizer,
        data_loader=trainloader,
        noise_multiplier=NOISE_MULTIPLIER,
        max_grad_norm=MAX_GRAD_NORM,
    )

    client = HealthClient(model, trainloader, privacy_engine, optimizer)
    fl.client.start_numpy_client(server_address=SERVER_ADDRESS, client=client)


if __name__ == "__main__":
    main()
