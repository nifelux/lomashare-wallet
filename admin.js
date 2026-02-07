/* ==================================
   LOMASHARES ADMIN DEPOSIT APPROVAL
   ================================== */

(function () {

  const container = document.getElementById("approvalList");

  function getAllWalletKeys() {
    return Object.keys(localStorage).filter(k =>
      k.startsWith("lomashares_wallet_")
    );
  }

  function render() {
    container.innerHTML = "";

    const keys = getAllWalletKeys();
    let found = false;

    keys.forEach(key => {
      const wallet = JSON.parse(localStorage.getItem(key));
      const username = key.replace("lomashares_wallet_", "");

      wallet.txs.forEach((tx, index) => {
        if (tx.type === "Deposit" && tx.status === "Pending") {
          found = true;

          const card = document.createElement("div");
          card.className = "card";

          card.innerHTML = `
            <div class="row">
              <div>
                <strong>${username}</strong><br>
                <small>${tx.ref}</small>
              </div>
              <div>₦${tx.amount.toLocaleString()}</div>
              <div><span class="badge">Pending</span></div>
              <div>
                <button class="btn approve">Approve</button>
                <button class="btn reject">Reject</button>
              </div>
            </div>
          `;

          card.querySelector(".approve").onclick = () =>
            approveDeposit(key, index);

          card.querySelector(".reject").onclick = () =>
            rejectDeposit(key, index);

          container.appendChild(card);
        }
      });
    });

    if (!found) {
      container.innerHTML = "<p>No pending deposits</p>";
    }
  }

  function approveDeposit(walletKey, txIndex) {
    const wallet = JSON.parse(localStorage.getItem(walletKey));
    const tx = wallet.txs[txIndex];

    wallet.pending -= tx.amount;
    wallet.approved += tx.amount;
    tx.status = "Approved";

    localStorage.setItem(walletKey, JSON.stringify(wallet));
    render();
    alert("Deposit approved");
  }

  function rejectDeposit(walletKey, txIndex) {
    const wallet = JSON.parse(localStorage.getItem(walletKey));
    const tx = wallet.txs[txIndex];

    wallet.pending -= tx.amount;
    tx.status = "Rejected";

    localStorage.setItem(walletKey, JSON.stringify(wallet));
    render();
    alert("Deposit rejected");
  }

  render();

})();
