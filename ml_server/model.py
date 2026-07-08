import torch
import torch.nn as nn


class CardiovascularRiskModel(nn.Module):
    """Feed-forward neural network for binary cardiovascular-risk prediction.

    Architecture:
        Input (13 clinical features) → 64 → 32 → 16 → 1 (sigmoid probability)

    Args:
        input_dim: Number of input clinical features (default: 13).
        dropout: Dropout probability applied after each hidden layer (default: 0.3).
    """

    def __init__(self, input_dim: int = 13, dropout: float = 0.3) -> None:
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.BatchNorm1d(64),
            nn.Dropout(dropout),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.BatchNorm1d(32),
            nn.Dropout(dropout),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)

    def count_parameters(self) -> int:
        """Return the total number of trainable parameters."""
        return sum(p.numel() for p in self.parameters() if p.requires_grad)


def get_model(input_dim: int = 13, dropout: float = 0.3) -> CardiovascularRiskModel:
    """Instantiate and return a CardiovascularRiskModel."""
    model = CardiovascularRiskModel(input_dim=input_dim, dropout=dropout)
    return model
