import React, { useState, useEffect } from "react";
import TradingViewWidget from "react-tradingview-widget";

function App() {
  const [user, setUser] = useState({
    loggedIn: false,
    kycDone: false,
    balance: 800.0,
    // Demo-only: do NOT use client-side password storage in production
    withdrawPassword: "",
  });

  const [tradeAmountPercent, setTradeAmountPercent] = useState(1); // percent of balance
  const [currency, setCurrency] = useState("ETHUSDT");
  const [tradeType, setTradeType] = useState(""); // CALL or PUT
  const [ukTime, setUkTime] = useState(
    new Date().toLocaleString("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  // Controlled inputs for deposit/withdraw
  const [depositAmount, setDepositAmount] = useState("");
  const [depositTxid, setDepositTxid] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPasswordInput, setWithdrawPasswordInput] = useState("");
  const [setPasswordInput, setSetPasswordInput] = useState("");

  // Update UK time every minute
  useEffect(() => {
    const updateTime = () => {
      const time = new Date().toLocaleString("en-GB", {
        timeZone: "Europe/London",
        hour: "2-digit",
        minute: "2-digit",
      });
      setUkTime(time);
    };
    const timer = setInterval(updateTime, 60_000);
    return () => clearInterval(timer);
  }, []);

  const computedTradeAmount = () => {
    const amount = (user.balance * Number(tradeAmountPercent)) / 100;
    // Keep 8 decimal places for crypto-like precision
    return Number.isFinite(amount) ? Number(amount.toFixed(8)) : 0;
  };

  const handleTrade = (type) => {
    if (!user.loggedIn) {
      return alert("Please log in first (demo).");
    }
    if (!user.kycDone) {
      return alert("Complete KYC to trade (demo).);
    }
    const amount = computedTradeAmount();
    if (!amount || amount <= 0) return alert("Trade amount must be greater than 0.");
    if (amount > user.balance) return alert("Insufficient balance for this trade.");
    const profit = Number((amount * 0.01).toFixed(8)); // demo: 1% profit
    setUser((prev) => ({ ...prev, balance: Number((prev.balance - amount + profit).toFixed(8)) }));
    setTradeType(type);
    alert(`Trade ${type} executed! Amount: ${amount} USDT, Profit: ${profit} USDT`);
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!user.kycDone) return alert("Complete KYC first (demo).);
    if (Number.isNaN(amount) || amount <= 0) return alert("Enter a valid deposit amount.");
    if (!depositTxid) return alert("Enter a valid TXID.");
    // In production: verify TXID on-chain / backend before crediting
    setUser((prev) => ({ ...prev, balance: Number((prev.balance + amount).toFixed(8)) }));
    alert(`Deposit success (demo)! Amount: ${amount} USDT, TXID: ${depositTxid}`);
    setDepositAmount("");
    setDepositTxid("");
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (Number.isNaN(amount) || amount <= 0) return alert("Enter a valid withdraw amount.");
    if (!withdrawPasswordInput) return alert("Enter your withdraw password (demo).);
    if (withdrawPasswordInput !== user.withdrawPassword)
      return alert("Incorrect withdraw password (demo).);
    if (amount > user.balance) return alert("Insufficient balance.");
    // In production: call backend to authenticate and perform withdrawal
    setUser((prev) => ({ ...prev, balance: Number((prev.balance - amount).toFixed(8)) }));
    alert(`Withdraw processed (demo): ${amount} USDT`);
    setWithdrawAmount("");
    setWithdrawPasswordInput("");
  };

  const handleSetWithdrawPassword = () => {
    if (!setPasswordInput) return alert("Enter a valid password.");
    // Demo-only: do not store passwords client-side in production
    setUser((prev) => ({ ...prev, withdrawPassword: setPasswordInput }));
    alert("Withdraw password set (demo).);
    setSetPasswordInput("");
  };

  // Demo helpers for toggling login/KYC
  const toggleLogin = () => setUser((p) => ({ ...p, loggedIn: !p.loggedIn }));
  const toggleKyc = () => setUser((p) => ({ ...p, kycDone: !p.kycDone }));

  const tradeAmount = computedTradeAmount();
  const canTrade = user.loggedIn && user.kycDone && tradeAmount > 0 && tradeAmount <= user.balance;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Asia Trade Exchange (demo)</h1>
      <p>UK Time: {ukTime}</p>

      {/* Currency selection */}
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setCurrency("ETHUSDT")}>ETH/USDT</button>
        <button onClick={() => setCurrency("BTCUSDT")}>BTC/USDT</button>
      </div>

      {/* TradingView chart */}
      <div style={{ height: "400px", width: "100%", marginBottom: "10px" }}>
        <TradingViewWidget symbol={currency} theme="light" autosize />
      </div>

      {/* Trade amount selection */}
      <div>
        <button onClick={() => setTradeAmountPercent(1)}>1%</button>
        <button onClick={() => setTradeAmountPercent(50)}>50%</button>
        <button onClick={() => setTradeAmountPercent(100)}>100%</button>
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={tradeAmountPercent}
          onChange={(e) => setTradeAmountPercent(e.target.value)}
          style={{ width: 120, marginLeft: 8 }}
          aria-label="Trade percent"
        />
        <p>Trade Amount: {tradeAmount} USDT</p>
      </div>

      {/* Trade buttons */}
      <div>
        <button onClick={() => handleTrade("CALL")} disabled={!canTrade}>
          CALL
        </button>
        <button onClick={() => handleTrade("PUT")} disabled={!canTrade}>
          PUT
        </button>
        {!user.loggedIn && <p style={{ color: "red" }}>You must log in to trade (demo).</p>}
        {user.loggedIn && !user.kycDone && <p style={{ color: "orange" }}>Complete KYC to enable trading (demo).</p>}
      </div>

      {/* Deposit / Withdraw */}
      <div style={{ marginTop: "20px" }}>
        <div>
          <h3>Deposit (demo)</h3>
          <input
            type="number"
            placeholder="Deposit Amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="TXID"
            value={depositTxid}
            onChange={(e) => setDepositTxid(e.target.value)}
          />
          <button onClick={handleDeposit} disabled={!user.kycDone}>
            Deposit
          </button>
          {!user.kycDone && <div style={{ color: "orange" }}>Complete KYC to deposit (demo).</div>}
        </div>

        <div style={{ marginTop: 12 }}>
          <h3>Withdraw (demo)</h3>
          <input
            type="number"
            placeholder="Withdraw Amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <input
            type="password"
            placeholder="Withdraw Password"
            value={withdrawPasswordInput}
            onChange={(e) => setWithdrawPasswordInput(e.target.value)}
          />
          <button onClick={handleWithdraw} disabled={!user.kycDone}>
            Withdraw
          </button>
          {!user.kycDone && <div style={{ color: "orange" }}>Complete KYC to withdraw (demo).</div>}
        </div>

        <div style={{ marginTop: 12 }}>
          <h3>Set Withdraw Password (demo only)</h3>
          <input
            type="password"
            placeholder="Set Withdraw Password"
            value={setPasswordInput}
            onChange={(e) => setSetPasswordInput(e.target.value)}
          />
          <button onClick={handleSetWithdrawPassword}>Set Password</button>
          <div style={{ fontSize: 12, color: "#666" }}>
            Demo-only: do not store or verify passwords client-side in production.
          </div>
        </div>
      </div>

      <p>Balance: {Number(user.balance).toFixed(8)} USDT</p>
      <p>Last Trade: {tradeType || "—"}</p>

      <div style={{ marginTop: 12 }}>
        <button onClick={toggleLogin}>{user.loggedIn ? "Log out (demo)" : "Log in (demo)"}</button>
        <button onClick={toggleKyc} style={{ marginLeft: 8 }}>
          {user.kycDone ? "Revoke KYC (demo)" : "Complete KYC (demo)"}
        </button>
      </div>

      <div style={{ marginTop: 12, color: "#666", fontSize: 12 }}>
        Important: This app is a front-end demo. All critical actions (auth, KYC, deposit validation, withdrawals,
        password checks) must be handled and validated on a secure backend over HTTPS. Never rely on client-side checks
        for real funds.
      </div>
    </div>
  );
}

export default App;