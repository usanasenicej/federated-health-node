import flwr as fl

def get_evaluate_fn(model):
    """Return an evaluation function for server-side evaluation."""
    # In a real scenario, we'd evaluate on a holdout dataset on the server
    # For now, we rely on federated evaluation
    return None

def main():
    # Define strategy
    strategy = fl.server.strategy.FedAvg(
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=2,
        min_evaluate_clients=2,
        min_available_clients=2,
        # evaluate_fn=get_evaluate_fn(model)
    )
    
    print("Starting Flower Server for HealthLedger FL...")
    fl.server.start_server(
        server_address="0.0.0.0:8080",
        config=fl.server.ServerConfig(num_rounds=3),
        strategy=strategy,
    )

if __name__ == "__main__":
    main()
