import torch
import torch.nn as nn

class CardiovascularRiskModel(nn.Module):
    def __init__(self, input_dim=13):
        super(CardiovascularRiskModel, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Dropout(0.3),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.BatchNorm1d(32),
            nn.Dropout(0.3),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.network(x)

def get_model(input_dim=13):
    return CardiovascularRiskModel(input_dim)
