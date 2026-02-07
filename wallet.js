/* ==============================
   LOMASHARES WALLET ENGINE
   ============================== */

window.LomaWallet = (function () {

  const PAYSTACK_KEY = "pk_live_cd8547f6b4270551729c247d8d31635691c39a08";

  const userNode = document.getElementById("userData");
  if (!userNode) return;

  const USER = userNode.dataset.username;
  const KEY = "lomashares_wallet_" + USER;

  function load() {
    return JSON.parse(localStorage.getItem(KEY)) || {
      approved: 0,
      pending: 0,
      txs: []
    };
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
    render();
  }

  function render() {
    const w = load();

    document.getElementById("walletApproved").innerText =
      "₦" + w.approved.toLocaleString();

    document.getElementById("walletPending").innerText =
      "₦" + w.pending.toLocaleString();

    document.getElementById("withdrawBtn").disabled =
      w.approved < 1000;

    const list = document.getElementById("walletTxs");
    list.innerHTML = "";

    w.txs.forEach(tx => {
      const div = document.createElement("div");
      div.className = "tx";
      div.innerHTML = `
        <strong>${tx.type}</strong> ₦${tx.amount.toLocaleString()}<br>
        <small>${tx.ref}</small><br>
        <span class="status ${tx.status.toLowerCase()}">${tx.status}</span>
      `;
      list.appendChild(div);
    });
  }

  /* ===== PUBLIC API ===== */

  function deposit() {
    const amount = Number(
      document.getElementById("depositAmount").value
    );

    if (!amount || amount < 100) {
      alert("Minimum deposit ₦100");
      return;
    }

    if (!window.PaystackPop) {
      alert("Payment service not loaded");
      return;
    }

    const ref = "LS-" + Date.now();

    PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: USER + "@lomashares.com",
      amount: amount * 100,
      currency: "NGN",
      ref: ref,
      callback() {
        const w = load();
        w.pending += amount;
        w.txs.unshift({
          type: "Deposit",
          amount,
          ref,
          status: "Pending"
        });
        save(w);
        alert("Deposit successful. Awaiting approval.");
      }
    }).openIframe();
  }

  function withdraw() {
    const w = load();
    const amt = Number(prompt("Enter withdrawal amount"));

    if (amt < 1000 || amt > w.approved) {
      alert("Invalid withdrawal amount");
      return;
    }

    w.approved -= amt;
    w.txs.unshift({
      type: "Withdrawal",
      amount: amt,
      ref: "WD-" + Date.now(),
      status: "Pending"
    });

    save(w);
    alert("Withdrawal request submitted");
  }

  document.addEventListener("DOMContentLoaded", render);

  return {
    load,
    save,
    render,
    deposit,
    withdraw
  };

})();
