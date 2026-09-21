"""Train and evaluate the Random Forest charging-time model.

Run with: python trainmodel.py/train.py data/charging_sessions.csv
"""

from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

FEATURES = ["battery_capacity_kwh", "current_charge_pct", "target_charge_pct", "charger_power_kw", "temperature_c", "battery_health_pct"]
TARGET = "charging_time_minutes"


def train(data_path: Path, output_path: Path) -> None:
    data = pd.read_csv(data_path)
    missing = set(FEATURES + [TARGET]) - set(data.columns)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {', '.join(sorted(missing))}")
    x_train, x_test, y_train, y_test = train_test_split(data[FEATURES], data[TARGET], test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42, min_samples_leaf=2, n_jobs=-1)
    model.fit(x_train, y_train)
    prediction = model.predict(x_test)
    print(f"MAE: {mean_absolute_error(y_test, prediction):.2f} min")
    print(f"RMSE: {mean_squared_error(y_test, prediction) ** 0.5:.2f} min")
    print(f"R²: {r2_score(y_test, prediction):.3f}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "features": FEATURES}, output_path)
    print(f"Saved model to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the EV charging time Random Forest model.")
    parser.add_argument("data", type=Path, help="CSV with model features and charging_time_minutes")
    parser.add_argument("--output", type=Path, default=Path("models/charging_time.joblib"))
    args = parser.parse_args()
    train(args.data, args.output)
