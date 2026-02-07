/* =====================================
   LOMASHARES INVESTMENT ENGINE
   Compatible with LomaWallet
   ===================================== */

window.LomaInvest = (function () {

  const user = document.getElementById("userData").dataset.username;
  const KEY = "lomashares_invest_" + user;

  const PRODUCTS = {
    1: { cost: 5000, daily: 1000, days: 7 },
    2: { cost: 13000, daily: 1500, days: 12 },
    3: { cost: 21000, daily: 2000, days: 15 }
  };

  function load() {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
    render();
  }

  function wallet() {
    return LomaWallet.load();
  }

  function updateWallet(w) {
    LomaWallet.save(w);
  }

  function now() {
    return Date.now();
  }

  /* ===== BUY SHARES ===== */
  function buyShares() {
    const shares = Number(document.getElementById("shareAmount").value);
    if (!shares || shares < 1) return alert("Invalid shares");

    const capital = shares * 1000;
    const w = wallet();

    if (w.approved < capital)
      return alert("Insufficient balance");

    w.approved -= capital;
    updateWallet(w);

    const list = load();
    list.unshift({
      type: "LomaShares",
      shares,
      capital,
      roi: 0.025,
      days: 40,
      start: now(),
      end: now() + 40 * 86400000,
      status: "Running"
    });

    save(list);
    alert("Investment started");
  }

  /* ===== BUY PRODUCT ===== */
  function buyProduct(id) {
    const p = PRODUCTS[id];
    const w = wallet();

    if (w.approved < p.cost)
      return alert("Insufficient balance");

    w.approved -= p.cost;
    updateWallet(w);

    const list = load();
    list.unshift({
      type: "Nifelux",
      product: id,
      capital: p.cost,
      daily: p.daily,
      days: p.days,
      start: now(),
      earned: 0,
      status: "Running"
    });

    save(list);
    alert("Product purchased");
  }

  /* ===== RENDER ===== */
  function render() {
    const list = load();
    const el = document.getElementById("investmentList");
    el.innerHTML = "";

    document.getElementById("walletBalance").innerText =
      "₦" + LomaWallet.load().approved.toLocaleString();

    if (!list.length) {
      el.innerHTML = "<p>No investments yet</p>";
      return;
    }

    list.forEach(inv => {
      const div = document.createElement("div");
      div.className = "invest-item";

      let info = inv.type === "LomaShares"
        ? `${inv.shares} shares · ₦${inv.capital.toLocaleString()}`
        : `Product ${inv.product} · ₦${inv.capital.toLocaleString()}`;

      div.innerHTML = `
        <strong>${inv.type}</strong>
        <span class="badge">${inv.status}</span><br>
        <small>${info}</small>
      `;
      el.appendChild(div);
    });
  }

  document.addEventListener("DOMContentLoaded", render);

  return {
    buyShares,
    buyProduct
  };

})();
