import flwr as fl
import logging
import os

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("healthledger.fl_server")

# ---------------------------------------------------------------------------
# Config (overridable via env vars for Docker / CI)
# ---------------------------------------------------------------------------
SERVER_ADDRESS = os.getenv("FL_SERVER_ADDRESS", "0.0.0.0:8080")
NUM_ROUNDS = int(os.getenv("FL_NUM_ROUNDS", "3"))
MIN_CLIENTS = int(os.getenv("FL_MIN_CLIENTS", "2"))


def get_evaluate_fn(model):
    """Return an evaluation function for server-side evaluation.

    In production this would run against a held-out validation set stored
    on the aggregation server. For now we rely on federated evaluation.
    """
    return None


def main():
    logger.info("=" * 60)
    logger.info("  HealthLedger FL — Federated Aggregation Server")
    logger.info("=" * 60)
    logger.info("  Address    : %s", SERVER_ADDRESS)
    logger.info("  Rounds     : %d", NUM_ROUNDS)
    logger.info("  Min clients: %d", MIN_CLIENTS)
    logger.info("=" * 60)

    strategy = fl.server.strategy.FedAvg(
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=MIN_CLIENTS,
        min_evaluate_clients=MIN_CLIENTS,
        min_available_clients=MIN_CLIENTS,
        # evaluate_fn=get_evaluate_fn(model)  # Uncomment when holdout set is ready
    )

    fl.server.start_server(
        server_address=SERVER_ADDRESS,
        config=fl.server.ServerConfig(num_rounds=NUM_ROUNDS),
        strategy=strategy,
    )


if __name__ == "__main__":
    main()
