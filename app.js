const fields = ["battery", "current", "target", "temperature", "health"];
const chargerData = {
  home: { power: 7.2, label: "Home AC", rate: 0.91, cost: 0.24 },
  fast: { power: 50, label: "Fast DC", rate: 0.93, cost: 0.42 },
  ultra: { power: 150, label: "Ultra-fast DC", rate: 0.84, cost: 0.58 },
};

function value(id) {
  return Number(document.getElementById(id).value);
}

function formatTime(minutes) {
  const rounded = Math.max(1, Math.round(minutes));
  return `${String(Math.floor(rounded / 60)).padStart(2, "0")}<span>h</span> ${String(rounded % 60).padStart(2, "0")}<span>m</span>`;
}

function updatePrediction(event) {
  if (event) event.preventDefault();
  const battery = value("battery");
  const current = value("current");
  const target = Math.max(current + 1, value("target"));
  const temperature = value("temperature");
  const health = value("health");
  const charger = chargerData[document.getElementById("charger").value];
  const energy = battery * (target - current) / 100;
  const temperatureFactor = 1 + Math.max(0, 15 - temperature) * 0.006 + Math.max(0, temperature - 30) * 0.008;
  const healthFactor = 1 + (100 - health) * 0.004;
  const taperFactor = target > 80 ? 1 + (target - 80) * 0.012 : 1;
  const minutes = (energy / (charger.power * charger.rate)) * 60 * temperatureFactor * healthFactor * taperFactor;
  const cost = energy * charger.cost;

  document.getElementById("hours").innerHTML = formatTime(minutes);
  document.getElementById("energy").textContent = `${energy.toFixed(1)} kWh`;
  document.getElementById("cost").textContent = `$${cost.toFixed(2)}`;
  document.getElementById("summary-battery").textContent = `${battery} kWh`;
  document.getElementById("summary-range").textContent = `${current}% → ${target}%`;
  document.getElementById("summary-charger").innerHTML = `${charger.label} <small>${charger.power} kW</small>`;
  document.getElementById("summary-conditions").innerHTML = `${temperature}°C <small>· ${health}% health</small>`;
  document.getElementById("recommendation").textContent =
    charger.power >= 50
      ? "Fast charging is ideal for a quick top-up. For daily use, stop near 80% to preserve battery health."
      : "Charge during off-peak hours (11 PM – 6 AM) to save up to 35%. A slower AC session is gentler on the battery.";
}

function runPrediction() {
  const button = document.querySelector(".mobile-predict");
  if (button) {
    button.classList.add("is-loading");
    button.querySelector(".mobile-predict-label").textContent = "Calculating";
  }
  window.setTimeout(() => {
    document.getElementById("prediction-form").requestSubmit();
    document.getElementById("hours").closest(".result-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    if (button) {
      button.classList.remove("is-loading");
      button.querySelector(".mobile-predict-label").textContent = "Predict Charging Time";
    }
  }, 350);
}

fields.forEach((id) => {
  const input = document.getElementById(id);
  const range = document.getElementById(`${id}-range`);
  range.addEventListener("input", () => { input.value = range.value; updatePrediction(); });
  input.addEventListener("input", () => { range.value = input.value; });
});
document.getElementById("prediction-form").addEventListener("submit", updatePrediction);
document.getElementById("charger").addEventListener("change", updatePrediction);
document.querySelector(".mobile-predict").addEventListener("click", runPrediction);

document.querySelectorAll(".mobile-nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".mobile-nav-item").forEach((navItem) => navItem.classList.remove("active"));
    item.classList.add("active");
  });
});
