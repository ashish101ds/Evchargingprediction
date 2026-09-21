# ChargeSense

ChargeSense is a responsive EV charging-time prediction dashboard. It runs as a static site on GitHub Pages (open `index.html`) and calculates an instant estimate from battery capacity, state of charge, charger type, temperature, and battery health.

## Run locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Train the Random Forest model

Install the Python dependencies and provide a CSV with these columns:

`battery_capacity_kwh,current_charge_pct,target_charge_pct,charger_power_kw,temperature_c,battery_health_pct,charging_time_minutes`

```bash
pip install -r requirements.txt
python trainmodel.py/train.py data/charging_sessions.csv
```

The training script prints MAE, RMSE, and R², then saves the model to `models/charging_time.joblib`. The static dashboard is intentionally dependency-free so it can be deployed directly to GitHub Pages.
