import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Sun, Moon, Plus, Minus, X, Search, ArrowUpRight, ArrowDownLeft,
  Check, ChevronRight, Wallet, LayoutDashboard, ShoppingBag, History,
  ArrowLeftRight, Cat, Coins, Receipt, LogOut, Send, Copy, Share2, Pencil,
} from "lucide-react";
import { supabase } from "./lib/supabaseClient";

/* ---------------------------------------------------------------- */
/* Data                                                              */
/* ---------------------------------------------------------------- */

const CATEGORIES = [
  { id: "semua", label: "Semua" },
  { id: "bolu", label: "Bolu" },
  { id: "donat", label: "Donat" },
  { id: "zuppa", label: "Zuppa" },
];

/* ---------------------------------------------------------------- */
/* Helpers                                                           */
/* ---------------------------------------------------------------- */

const rupiah = (n) => "Rp" + Math.round(n || 0).toLocaleString("id-ID");

function walletDelta(tx, wallet) {
  if (tx.type === "penjualan") {
    if (wallet === "modal") return { amount: tx.hpp, dir: "in" };
    return { amount: tx.profit, dir: "in" };
  }
  if (tx.type === "setor_modal" && wallet === "modal") return { amount: tx.amount, dir: "in" };
  if (tx.type === "tarik_keuntungan" && wallet === "keuntungan") return { amount: tx.amount, dir: "out" };
  if (tx.type === "pengeluaran" && tx.wallet === wallet) return { amount: tx.amount, dir: "out" };
  if (tx.type === "transfer") {
    if (tx.from === wallet) return { amount: tx.amount, dir: "out" };
    if (tx.to === wallet) return { amount: tx.amount, dir: "in" };
  }
  return null;
}

function txMeta(tx) {
  switch (tx.type) {
    case "penjualan":
      return { label: "Penjualan", sub: `${tx.items.length} item`, icon: ShoppingBag, amount: tx.total, dir: "in" };
    case "setor_modal":
      return { label: "Setor Modal", sub: tx.note || "Tambahan modal", icon: Cat, amount: tx.amount, dir: "in" };
    case "tarik_keuntungan":
      return { label: "Tarik Keuntungan", sub: tx.note || "Penarikan", icon: Coins, amount: tx.amount, dir: "out" };
    case "pengeluaran":
      return { label: "Pengeluaran", sub: tx.note || (tx.wallet === "modal" ? "Dompet Modal" : "Dompet Keuntungan"), icon: Receipt, amount: tx.amount, dir: "out" };
    case "transfer":
      return { label: "Transfer Antar Dompet", sub: `${tx.from === "modal" ? "Modal" : "Keuntungan"} → ${tx.to === "modal" ? "Modal" : "Keuntungan"}`, icon: ArrowLeftRight, amount: tx.amount, dir: "neutral" };
    default:
      return { label: "Transaksi", sub: "", icon: Receipt, amount: 0, dir: "neutral" };
  }
}

function dateLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return "Hari ini";
  if (sameDay(d, yest)) return "Kemarin";
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
}

function timeLabel(iso) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function dateTimeLabel(iso) {
  const d = new Date(iso);
  const tgl = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${tgl}, ${jam}`;
}

function todayInputDate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toLocalDatetimeInputValue(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatTanggalLaporan(inputDate) {
  const d = new Date(inputDate + "T00:00:00");
  const hari = d.toLocaleDateString("id-ID", { weekday: "long" }).toUpperCase();
  const tgl = String(d.getDate()).padStart(2, "0");
  const bulan = d.toLocaleDateString("id-ID", { month: "long" }).toUpperCase();
  return `${hari},${tgl} ${bulan} ${d.getFullYear()}`;
}

function fmtAngka(n) {
  return Math.round(n || 0).toLocaleString("id-ID");
}

/**
 * Input nominal Rupiah yang aman dipakai di HP.
 * Selalu memaksa kursor ke akhir teks setiap kali berubah, supaya angka
 * tidak "tersisip" di tengah saat React memformat ulang tampilannya
 * (mis. menambah titik ribuan) — masalah umum di keyboard angka HP.
 */
function RupiahInput({ value, onChange, placeholder }) {
  const ref = useRef(null);
  const numeric = value ? Number(String(value).replace(/\D/g, "")) : 0;
  const display = value ? numeric.toLocaleString("id-ID") : "";

  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement === el) {
      const end = el.value.length;
      el.setSelectionRange(end, end);
    }
  }, [display]);

  return (
    <input
      ref={ref}
      inputMode="numeric"
      placeholder={placeholder || "0"}
      value={display}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
    />
  );
}

function computeLaporanNumbers({ inputDate, transactions, products }) {
  const dayTx = transactions.filter((tx) => {
    const d = new Date(tx.date);
    const pad = (n) => String(n).padStart(2, "0");
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return key === inputDate;
  });

  const catList = CATEGORIES.filter((c) => c.id !== "semua");
  const catTotals = {};
  catList.forEach((c) => { catTotals[c.id] = 0; });
  let lainnya = 0;
  let omset = 0;
  let belanjaBahanTotal = 0; // total HPP/modal barang yang terjual hari itu

  dayTx.forEach((tx) => {
    if (tx.type === "penjualan") {
      omset += tx.total;
      belanjaBahanTotal += tx.hpp || 0;
      (tx.items || []).forEach((it) => {
        const prod = products.find((p) => p.id === it.id);
        const amt = it.price * it.qty;
        if (prod && catTotals[prod.category] !== undefined) catTotals[prod.category] += amt;
        else lainnya += amt;
      });
    }
  });

  // Serahan hanya berasal dari Dompet Keuntungan: pengeluaran dari Dompet
  // Keuntungan + Tarik Keuntungan yang mengurangi jumlah yang diserahkan.
  // Uang modal (Belanja Bahan) TIDAK ikut mengurangi Serahan.
  // Transfer antar dompet TIDAK dimasukkan ke laporan WhatsApp.
  const expenseTx = dayTx.filter(
    (tx) => (tx.type === "pengeluaran" && tx.wallet !== "modal") || tx.type === "tarik_keuntungan"
  );
  const keluaran = expenseTx.reduce((s, tx) => s + tx.amount, 0);

  return { catList, catTotals, lainnya, omset, expenseTx, keluaran, belanjaBahanTotal };
}

function buildLaporanText({ inputDate, transactions, products, serahanOverride }) {
  const { catList, catTotals, lainnya, omset, expenseTx, keluaran, belanjaBahanTotal } = computeLaporanNumbers({
    inputDate,
    transactions,
    products,
  });

  const labelWidth = Math.max(12, ...catList.map((c) => c.label.length), "Lainnya".length) + 1;
  const catEntries = catList.map((c) => ({
    label: c.label,
    valueText: catTotals[c.id] > 0 ? fmtAngka(catTotals[c.id]) : "-",
  }));
  if (lainnya > 0) catEntries.push({ label: "Lainnya", valueText: fmtAngka(lainnya) });
  const catValWidth = Math.max(...catEntries.map((e) => e.valueText.length));
  const catLines = catEntries
    .map((e) => `- ${e.label.padEnd(labelWidth)}= ${e.valueText.padStart(catValWidth)}`)
    .join("\n");

  const expEntries = expenseTx.map((tx) => ({
    label: tx.note || (tx.type === "tarik_keuntungan" ? "Tarik Keuntungan" : "Pengeluaran"),
    valueText: fmtAngka(tx.amount),
  }));
  if (belanjaBahanTotal > 0) {
    expEntries.push({ label: "Belanja Bahan", valueText: fmtAngka(belanjaBahanTotal) });
  }
  const expLabelWidth = Math.max(14, ...expEntries.map((e) => e.label.length)) + 1;
  const expValWidth = expEntries.length ? Math.max(...expEntries.map((e) => e.valueText.length)) : 0;
  const expenseLinesText = expEntries.length
    ? expEntries.map((e) => `${e.label.padEnd(expLabelWidth)}= ${e.valueText.padStart(expValWidth)}`).join("\n")
    : "(Tiada pengeluaran)";

  const totalKeluaran = keluaran + belanjaBahanTotal;
  const serahanAuto = omset - totalKeluaran;
  const hasOverride = serahanOverride !== null && serahanOverride !== undefined && serahanOverride !== "";
  const serahanText = hasOverride
    ? fmtAngka(Number(serahanOverride))
    : serahanAuto > 0
    ? fmtAngka(serahanAuto)
    : "TIADA";

  const omsetText = fmtAngka(omset);
  const totalKeluaranText = fmtAngka(totalKeluaran);
  const summaryValWidth = Math.max(omsetText.length, totalKeluaranText.length, serahanText.length);

  return `*MOHON IZIN KONGSIKAN*

_LAPORAN OMSET PREMIS_
\`\`\`
TARIKH : ${formatTanggalLaporan(inputDate)}
UNIT   : MATARAM BAKERY
${catLines}
•••••••••••••••••••••
Rincian Pengeluaran :

${expenseLinesText}

TOTAL KELUARAN  = ${totalKeluaranText.padStart(summaryValWidth)}
••••••••••••••••••••
OMSET         = ${omsetText.padStart(summaryValWidth)}
KELUARAN      = ${totalKeluaranText.padStart(summaryValWidth)}
SERAHAN       = ${serahanText.padStart(summaryValWidth)}
\`\`\`
*YA ALLAH TLG LAH*`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

/* ---------------------------------------------------------------- */
/* Small building blocks                                             */
/* ---------------------------------------------------------------- */

function AnimatedNumber({ value, prefix = "Rp" }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const t0 = performance.now();
    const duration = 650;
    let raf;
    function tick(now) {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (end - start) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = end;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span>{prefix}{Math.round(display).toLocaleString("id-ID")}</span>;
}

function Glyph({ kind, size = 26 }) {
  const common = { viewBox: "0 0 40 40", width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (kind === "bread")
    return (<svg {...common}><path d="M8 22c0-8 5-14 12-14s12 6 12 14c0 6-4 9-12 9S8 28 8 22Z" /><path d="M14 16c1.5-1.5 3-2 6-2s4.5.5 6 2" /><path d="M13 24h14M14 28h12" /></svg>);
  if (kind === "pastry")
    return (<svg {...common}><path d="M7 27c-1.5-9 5-19 15-19 2.6 0 4.6.6 6 1.4-8 1-13.4 8-13.4 15.6 0 2.6.8 4.6 1.7 6.4-4.3.2-8-1-9.3-4.4Z" /></svg>);
  if (kind === "cake")
    return (<svg {...common}><path d="M20 7l9 15H11l9-15Z" /><circle cx="20" cy="5.4" r="1.4" fill="currentColor" stroke="none" /><path d="M8 23h24v5a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-5Z" /></svg>);
  return (<svg {...common}><circle cx="20" cy="20" r="13" /><circle cx="15.5" cy="16" r="1.3" fill="currentColor" stroke="none" /><circle cx="25" cy="15.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="26" cy="23" r="1.3" fill="currentColor" stroke="none" /><circle cx="16.5" cy="25" r="1.3" fill="currentColor" stroke="none" /></svg>);
}

function Sheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="mb-backdrop" onClick={onClose}>
      <div className="mb-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="mb-sheet-handle" />
        <div className="mb-sheet-head">
          <h3>{title}</h3>
          <button className="mb-iconbtn" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AmountForm({ accent, quickAmounts, noteholder, submitLabel, onSubmit, helper }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const numeric = Number(amount.replace(/\D/g, "")) || 0;

  return (
    <div className="mb-form">
      {helper && <p className="mb-form-helper">{helper}</p>}
      <label className="mb-form-label">Jumlah</label>
      <div className="mb-amount-input" style={{ "--accent": accent }}>
        <span>Rp</span>
        <RupiahInput value={amount} onChange={setAmount} placeholder="0" />
      </div>
      <div className="mb-quick-row">
        {quickAmounts.map((q) => (
          <button key={q} className="mb-chip" onClick={() => setAmount(String(q))}>
            {q >= 1000000 ? `${q / 1000000}jt` : `${q / 1000}rb`}
          </button>
        ))}
      </div>
      <label className="mb-form-label">Catatan (opsional)</label>
      <input className="mb-text-input" placeholder={noteholder} value={note} onChange={(e) => setNote(e.target.value)} />
      <button
        className="mb-submit-btn"
        style={{ "--accent": accent }}
        disabled={numeric <= 0}
        onClick={() => { onSubmit(numeric, note); setAmount(""); setNote(""); }}
      >
        {submitLabel}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Main App                                                          */
/* ---------------------------------------------------------------- */

const TABS = [
  { id: "dashboard", label: "Beranda", icon: LayoutDashboard },
  { id: "kasir", label: "Kasir", icon: ShoppingBag },
  { id: "dompet", label: "Dompet", icon: Wallet },
  { id: "riwayat", label: "Riwayat", icon: History },
];

export default function MainApp({ isAdmin, userEmail, userId, onSignOut, dark, setDark }) {
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true })
      .then(({ data, error }) => {
        if (active && !error) setProducts(data || []);
      });
    return () => {
      active = false;
    };
  }, []);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (active && !error) setTransactions(data || []);
        if (active) setTxLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const [cart, setCart] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [lastSale, setLastSale] = useState(null);
  const [category, setCategory] = useState("semua");
  const [query, setQuery] = useState("");
  const [walletTab, setWalletTab] = useState("modal");
  const [expenseWallet, setExpenseWallet] = useState("modal");
  const [transferDir, setTransferDir] = useState("modal_to_keuntungan");

  const wallets = useMemo(() => {
    let modal = 0, keuntungan = 0;
    transactions.forEach((tx) => {
      if (tx.type === "penjualan") { modal += tx.hpp; keuntungan += tx.profit; }
      else if (tx.type === "setor_modal") modal += tx.amount;
      else if (tx.type === "tarik_keuntungan") keuntungan -= tx.amount;
      else if (tx.type === "pengeluaran") { if (tx.wallet === "modal") modal -= tx.amount; else keuntungan -= tx.amount; }
      else if (tx.type === "transfer") {
        if (tx.from === "modal") modal -= tx.amount; else keuntungan -= tx.amount;
        if (tx.to === "modal") modal += tx.amount; else keuntungan += tx.amount;
      }
    });
    return { modal, keuntungan };
  }, [transactions]);

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    return days.map((d) => {
      const start = d.getTime();
      const end = start + 86400000;
      let masuk = 0, keluar = 0;
      transactions.forEach((tx) => {
        const t = new Date(tx.date).getTime();
        if (t >= start && t < end) {
          if (tx.type === "penjualan") masuk += tx.total;
          else if (tx.type === "setor_modal") masuk += tx.amount;
          else if (tx.type === "tarik_keuntungan") keluar += tx.amount;
          else if (tx.type === "pengeluaran") keluar += tx.amount;
        }
      });
      return { label: d.toLocaleDateString("id-ID", { weekday: "short" }), masuk, keluar };
    });
  }, [transactions]);

  const todayRevenue = useMemo(() => {
    const today = new Date().toDateString();
    return transactions
      .filter((tx) => tx.type === "penjualan" && new Date(tx.date).toDateString() === today)
      .reduce((s, tx) => s + tx.total, 0);
  }, [transactions]);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return transactions.filter((tx) => tx.type === "penjualan" && new Date(tx.date).toDateString() === today).length;
  }, [transactions]);

  const cartItems = cart.map((c) => {
    if (c.manual) return { id: c.id, name: c.name, price: c.price, cost: c.cost || 0, kind: "manual", qty: c.qty };
    return { ...(products.find((p) => p.id === c.id) || {}), qty: c.qty };
  });
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCost = cartItems.reduce((s, i) => s + i.cost * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  function addToCart(id) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id, qty: 1 }];
    });
  }
  function addManualItem({ name, price, cost, qty }) {
    const id = `manual-${Date.now()}`;
    setCart((prev) => [...prev, { id, manual: true, name, price, cost: cost || 0, qty: qty || 1 }]);
  }
  function changeQty(id, delta) {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  }

  async function checkout() {
    if (cartItems.length === 0) return;
    const payload = {
      type: "penjualan",
      date: new Date().toISOString(),
      total: cartTotal,
      hpp: cartCost,
      profit: cartTotal - cartCost,
      items: cartItems.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
      created_by: userId,
    };
    const { data, error } = await supabase.from("transactions").insert(payload).select().single();
    if (error) {
      alert("Gagal menyimpan transaksi: " + error.message);
      return;
    }
    setTransactions((prev) => [data, ...prev]);
    setLastSale(data);
    setCart([]);
    setSheet("success");
  }

  async function pushTx(tx) {
    const payload = { date: new Date().toISOString(), created_by: userId, ...tx };
    const { data, error } = await supabase.from("transactions").insert(payload).select().single();
    if (error) {
      alert("Gagal menyimpan transaksi: " + error.message);
      return;
    }
    setTransactions((prev) => [data, ...prev]);
  }

  async function deleteTransaction(id) {
    if (!isAdmin) return;
    if (!window.confirm("Hapus riwayat transaksi ini?")) return;
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) {
      alert("Gagal menghapus riwayat: " + error.message);
      return;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  async function deleteAllTransactions() {
    if (!isAdmin) return;
    if (!window.confirm("Hapus SEMUA riwayat transaksi? Tindakan ini tidak bisa dibatalkan.")) return;
    const { error } = await supabase.from("transactions").delete().gt("id", 0);
    if (error) {
      alert("Gagal menghapus semua riwayat: " + error.message);
      return;
    }
    setTransactions([]);
  }

  async function updateTransaction(id, patch) {
    if (!isAdmin) return;
    const { data, error } = await supabase.from("transactions").update(patch).eq("id", id).select().single();
    if (error) {
      alert("Gagal menyimpan perubahan riwayat: " + error.message);
      return;
    }
    setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)));
    setEditingTx(null);
    setSheet(null);
  }

  async function addProduct(p) {
    const payload = { ...p, created_by: userId };
    const { data, error } = await supabase.from("products").insert(payload).select().single();
    if (error) {
      alert("Gagal menambah produk: " + error.message);
      return;
    }
    setProducts((prev) => [...prev, data]);
  }
  async function deleteProduct(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Gagal menghapus produk: " + error.message);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  const filteredProducts = products.filter(
    (p) => (category === "semua" || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = useMemo(() => {
    const map = new Map();
    transactions.forEach((tx) => {
      const key = new Date(tx.date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(tx);
    });
    return Array.from(map.entries());
  }, [transactions]);

  const walletTxs = transactions
    .map((tx) => ({ tx, delta: walletDelta(tx, walletTab) }))
    .filter((x) => x.delta);

  const activeIndex = TABS.findIndex((t) => t.id === tab);

  return (
    <>
      {/* Header */}
      <div className="mb-header">
        <div className="mb-brand">
          <div className="mb-logo">M</div>
          <div>
            <div className="mb-brand-name">Mataram Bakery</div>
            <div className="mb-brand-sub">{userEmail}{isAdmin ? " · Admin" : ""}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="mb-toggle" onClick={onSignOut} aria-label="Keluar">
            <LogOut size={16} />
          </button>
          <button className="mb-toggle" onClick={() => setDark((d) => !d)} aria-label="Ganti tema">
            <span className={`mb-toggle-icon ${dark ? "spin" : ""}`}>{dark ? <Moon size={17} /> : <Sun size={17} />}</span>
          </button>
        </div>
      </div>

        {/* Content */}
        <div className="mb-content">
          <div key={tab} className="mb-fade">
            {tab === "dashboard" && (
              <Dashboard
                wallets={wallets}
                chartData={chartData}
                todayRevenue={todayRevenue}
                todayCount={todayCount}
                transactions={transactions.slice(0, 5)}
              />
            )}
            {tab === "kasir" && (
              <Kasir
                query={query} setQuery={setQuery}
                category={category} setCategory={setCategory}
                products={filteredProducts}
                addToCart={addToCart}
                onDeleteProduct={deleteProduct}
                onOpenAdd={() => setSheet("addProduct")}
              />
            )}
            {tab === "dompet" && (
              <Dompet
                wallets={wallets}
                walletTab={walletTab} setWalletTab={setWalletTab}
                walletTxs={walletTxs}
                onOpenSheet={(s) => setSheet(s)}
              />
            )}
            {tab === "riwayat" && (
              <Riwayat
                grouped={grouped}
                isAdmin={isAdmin}
                onDelete={deleteTransaction}
                onEdit={(tx) => { setEditingTx(tx); setSheet("editTx"); }}
                onDeleteAll={deleteAllTransactions}
                onOpenSheet={(s) => setSheet(s)}
              />
            )}
          </div>
        </div>

        {/* Cart bar (Kasir only) */}
        {tab === "kasir" && cartCount > 0 && (
          <button className="mb-cartbar" onClick={() => setSheet("cart")}>
            <span className="mb-cartbar-count">{cartCount}</span>
            <span>Lihat Keranjang</span>
            <span className="mb-cartbar-total">{rupiah(cartTotal)}</span>
          </button>
        )}

        {/* Bottom nav */}
        <div className="mb-nav">
          <div className="mb-nav-indicator" style={{ left: `${activeIndex * 25}%` }} />
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button key={t.id} className={`mb-navitem ${active ? "active" : ""}`} onClick={() => setTab(t.id)}>
                <Icon size={19} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

      {/* ---- Sheets ---- */}
      <Sheet open={sheet === "cart"} onClose={() => setSheet(null)} title="Keranjang">
        {cartItems.length === 0 ? (
          <div className="mb-empty">
            <ShoppingBag size={32} />
            <p>Keranjang kosong</p>
            <button className="mb-action-btn gold" style={{ marginTop: 14 }} onClick={() => setSheet("manualItem")}>
              <Plus size={16} /> Tambah Item Manual
            </button>
          </div>
        ) : (
          <>
            <div className="mb-cart-list">
              {cartItems.map((item) => (
                <div className="mb-cart-row" key={item.id}>
                  <div className="mb-cart-glyph"><Glyph kind={item.kind} size={20} /></div>
                  <div className="mb-cart-info">
                    <div className="mb-cart-name">{item.name}</div>
                    <div className="mb-cart-price">{rupiah(item.price)}</div>
                  </div>
                  <div className="mb-qty">
                    <button onClick={() => changeQty(item.id, -1)}><Minus size={14} /></button>
                    <span>{item.qty}</span>
                    <button onClick={() => changeQty(item.id, 1)}><Plus size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mb-action-btn gold" style={{ margin: "4px 0 14px" }} onClick={() => setSheet("manualItem")}>
              <Plus size={16} /> Tambah Item Manual
            </button>
            <div className="mb-cart-summary">
              <div className="mb-summary-row"><span>Subtotal</span><span>{rupiah(cartTotal)}</span></div>
              <div className="mb-summary-row muted"><span>Estimasi keuntungan</span><span>{rupiah(cartTotal - cartCost)}</span></div>
              <button className="mb-submit-btn" style={{ "--accent": "var(--gold)" }} onClick={checkout}>
                Bayar {rupiah(cartTotal)}
              </button>
            </div>
          </>
        )}
      </Sheet>

      <Sheet open={sheet === "manualItem"} onClose={() => setSheet("cart")} title="Tambah Item Manual">
        <ManualItemForm onSubmit={(item) => { addManualItem(item); setSheet("cart"); }} />
      </Sheet>

      <Sheet open={sheet === "success"} onClose={() => setSheet(null)} title="">
        {lastSale && (
          <div className="mb-success">
            <div className="mb-check-circle">
              <svg viewBox="0 0 52 52" width="56" height="56">
                <circle cx="26" cy="26" r="24" fill="none" stroke="var(--gold)" strokeWidth="2.5" />
                <path d="M15 27l7 7 15-15" fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mb-check-path" />
              </svg>
            </div>
            <h3>Pembayaran Berhasil</h3>
            <p className="mb-success-total">{rupiah(lastSale.total)}</p>
            <div className="mb-success-split">
              <span>Modal +{rupiah(lastSale.hpp)}</span>
              <span>Keuntungan +{rupiah(lastSale.profit)}</span>
            </div>
            <button className="mb-submit-btn" style={{ "--accent": "var(--gold)" }} onClick={() => setSheet(null)}>Selesai</button>
          </div>
        )}
      </Sheet>

      <Sheet open={sheet === "addModal"} onClose={() => setSheet(null)} title="Setor Modal">
        <AmountForm
          accent="var(--teal)"
          quickAmounts={[100000, 500000, 1000000, 2000000]}
          noteholder="mis. tambahan modal dari pemilik"
          submitLabel="Setor ke Dompet Modal"
          onSubmit={(amount, note) => { pushTx({ type: "setor_modal", amount, note }); setSheet(null); }}
        />
      </Sheet>

      <Sheet open={sheet === "withdraw"} onClose={() => setSheet(null)} title="Tarik Keuntungan">
        <AmountForm
          accent="var(--green)"
          quickAmounts={[50000, 100000, 250000, 500000]}
          noteholder="mis. ambil keuntungan bulanan"
          submitLabel="Tarik dari Dompet Keuntungan"
          helper={`Saldo tersedia ${rupiah(wallets.keuntungan)}`}
          onSubmit={(amount, note) => { pushTx({ type: "tarik_keuntungan", amount, note }); setSheet(null); }}
        />
      </Sheet>

      <Sheet open={sheet === "expense"} onClose={() => setSheet(null)} title="Catat Pengeluaran">
        <div className="mb-segment">
          <button className={expenseWallet === "modal" ? "active" : ""} onClick={() => setExpenseWallet("modal")}>Dompet Modal</button>
          <button className={expenseWallet === "keuntungan" ? "active" : ""} onClick={() => setExpenseWallet("keuntungan")}>Dompet Keuntungan</button>
        </div>
        <AmountForm
          accent="var(--red)"
          quickAmounts={[25000, 50000, 100000, 250000]}
          noteholder="mis. beli bahan baku"
          submitLabel="Catat Pengeluaran"
          onSubmit={(amount, note) => { pushTx({ type: "pengeluaran", amount, note, wallet: expenseWallet }); setSheet(null); }}
        />
      </Sheet>

      <Sheet open={sheet === "transfer"} onClose={() => setSheet(null)} title="Transfer Antar Dompet">
        <div className="mb-segment">
          <button className={transferDir === "modal_to_keuntungan" ? "active" : ""} onClick={() => setTransferDir("modal_to_keuntungan")}>Modal → Keuntungan</button>
          <button className={transferDir === "keuntungan_to_modal" ? "active" : ""} onClick={() => setTransferDir("keuntungan_to_modal")}>Keuntungan → Modal</button>
        </div>
        <AmountForm
          accent="var(--gold)"
          quickAmounts={[50000, 100000, 250000, 500000]}
          noteholder="mis. penyesuaian saldo"
          submitLabel="Transfer Sekarang"
          onSubmit={(amount, note) => {
            const from = transferDir === "modal_to_keuntungan" ? "modal" : "keuntungan";
            const to = transferDir === "modal_to_keuntungan" ? "keuntungan" : "modal";
            pushTx({ type: "transfer", amount, note, from, to });
            setSheet(null);
          }}
        />
      </Sheet>

      <Sheet open={sheet === "addProduct"} onClose={() => setSheet(null)} title="Tambah Produk Baru">
        <AddProductForm onSubmit={(p) => { addProduct(p); setSheet(null); }} />
      </Sheet>

      <Sheet open={sheet === "laporan"} onClose={() => setSheet(null)} title="Laporan WhatsApp">
        <LaporanForm transactions={transactions} products={products} />
      </Sheet>

      <Sheet open={sheet === "editTx"} onClose={() => { setSheet(null); setEditingTx(null); }} title="Edit Transaksi">
        {editingTx && (
          <EditTxForm
            tx={editingTx}
            onSubmit={(patch) => updateTransaction(editingTx.id, patch)}
          />
        )}
      </Sheet>
    </>
  );
}

function AddProductForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("bolu");
  const [kind, setKind] = useState("bread");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");

  const costNum = Number(cost.replace(/\D/g, "")) || 0;
  const priceNum = Number(price.replace(/\D/g, "")) || 0;
  const valid = name.trim().length > 0 && priceNum > 0;

  return (
    <div className="mb-form">
      <label className="mb-form-label">Nama Produk</label>
      <input className="mb-text-input" placeholder="mis. Roti Pisang Coklat" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 14 }} />

      <label className="mb-form-label">Kategori</label>
      <div className="mb-cat-picker">
        {CATEGORIES.filter((c) => c.id !== "semua").map((c) => (
          <button key={c.id} className={category === c.id ? "active" : ""} onClick={() => setCategory(c.id)}>{c.label}</button>
        ))}
      </div>

      <label className="mb-form-label">Ikon</label>
      <div className="mb-glyph-picker">
        {["bread", "pastry", "cake", "cookie"].map((k) => (
          <button key={k} className={`mb-glyph-option ${kind === k ? "active" : ""}`} onClick={() => setKind(k)}>
            <Glyph kind={k} size={22} />
          </button>
        ))}
      </div>

      <div className="mb-two-col">
        <div>
          <label className="mb-form-label">Harga Modal</label>
          <div className="mb-amount-input" style={{ "--accent": "var(--teal)" }}>
            <span>Rp</span>
            <RupiahInput value={cost} onChange={setCost} />
          </div>
        </div>
        <div>
          <label className="mb-form-label">Harga Jual</label>
          <div className="mb-amount-input" style={{ "--accent": "var(--gold)" }}>
            <span>Rp</span>
            <RupiahInput value={price} onChange={setPrice} />
          </div>
        </div>
      </div>

      <button
        className="mb-submit-btn"
        style={{ "--accent": "var(--gold)" }}
        disabled={!valid}
        onClick={() => onSubmit({ name: name.trim(), category, kind, cost: costNum, price: priceNum })}
      >
        Tambah ke Menu
      </button>
    </div>
  );
}

function ManualItemForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [qty, setQty] = useState(1);

  const priceNum = Number(price.replace(/\D/g, "")) || 0;
  const costNum = Number(cost.replace(/\D/g, "")) || 0;
  const valid = name.trim().length > 0 && priceNum > 0;

  return (
    <div className="mb-form">
      <p className="mb-form-helper" style={{ marginBottom: 14 }}>
        Untuk barang yang belum ada di menu, misalnya pesanan custom.
      </p>

      <label className="mb-form-label">Nama Barang</label>
      <input
        className="mb-text-input"
        style={{ marginBottom: 14 }}
        placeholder="mis. Kue Custom Ulang Tahun"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="mb-two-col" style={{ marginBottom: 14 }}>
        <div>
          <label className="mb-form-label">Harga Jual</label>
          <div className="mb-amount-input" style={{ "--accent": "var(--gold)" }}>
            <span>Rp</span>
            <RupiahInput value={price} onChange={setPrice} />
          </div>
        </div>
        <div>
          <label className="mb-form-label">Harga Modal (opsional)</label>
          <div className="mb-amount-input" style={{ "--accent": "var(--teal)" }}>
            <span>Rp</span>
            <RupiahInput value={cost} onChange={setCost} />
          </div>
        </div>
      </div>

      <label className="mb-form-label">Jumlah</label>
      <div className="mb-qty" style={{ marginBottom: 20, alignSelf: "flex-start" }}>
        <button onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={14} /></button>
        <span>{qty}</span>
        <button onClick={() => setQty((q) => q + 1)}><Plus size={14} /></button>
      </div>

      <button
        className="mb-submit-btn"
        style={{ "--accent": "var(--gold)" }}
        disabled={!valid}
        onClick={() => onSubmit({ name: name.trim(), price: priceNum, cost: costNum, qty })}
      >
        Tambah ke Keranjang
      </button>
    </div>
  );
}

function LaporanForm({ transactions, products }) {
  const [inputDate, setInputDate] = useState(todayInputDate());
  const [serahanInput, setSerahanInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSerahanInput("");
  }, [inputDate]);

  const { omset, keluaran, belanjaBahanTotal } = useMemo(
    () => computeLaporanNumbers({ inputDate, transactions, products }),
    [inputDate, transactions, products]
  );
  const serahanAuto = omset - (keluaran + belanjaBahanTotal);

  const text = useMemo(
    () => buildLaporanText({ inputDate, transactions, products, serahanOverride: serahanInput || null }),
    [inputDate, transactions, products, serahanInput]
  );

  function kirimWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function salinTeks() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("Gagal menyalin teks. Salin manual dari kotak pratinjau di bawah.");
    }
  }

  return (
    <div className="mb-form">
      <label className="mb-form-label">Tanggal</label>
      <input
        type="date"
        className="mb-text-input"
        style={{ marginBottom: 14 }}
        value={inputDate}
        onChange={(e) => setInputDate(e.target.value)}
      />

      <label className="mb-form-label">Serahan</label>
      <div className="mb-amount-input" style={{ marginBottom: 6 }}>
        <span>Rp</span>
        <RupiahInput value={serahanInput} onChange={setSerahanInput} placeholder={fmtAngka(serahanAuto)} />
      </div>
      <p className="mb-form-helper" style={{ marginBottom: 14 }}>
        Otomatis: Rp {fmtAngka(serahanAuto)} (Omset dikurangi Keluaran). Isi kotak ini kalau mau ubah manual.
      </p>

      <label className="mb-form-label">Pratinjau Laporan</label>
      <pre className="mb-laporan-preview">{text}</pre>

      <div className="mb-two-col" style={{ marginTop: 4 }}>
        <button className="mb-action-btn teal" onClick={salinTeks}>
          {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Tersalin" : "Salin Teks"}
        </button>
        <button className="mb-submit-btn" style={{ "--accent": "#25D366", marginTop: 0 }} onClick={kirimWhatsApp}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <Send size={16} /> Kirim ke WhatsApp
          </span>
        </button>
      </div>
    </div>
  );
}

function EditTxForm({ tx, onSubmit }) {
  const [dateVal, setDateVal] = useState(toLocalDatetimeInputValue(tx.date));
  const [note, setNote] = useState(tx.note || "");
  const [total, setTotal] = useState(String(tx.total || ""));
  const [hpp, setHpp] = useState(String(tx.hpp || ""));
  const [amount, setAmount] = useState(String(tx.amount || ""));
  const [wallet, setWallet] = useState(tx.wallet || "modal");
  const [from, setFrom] = useState(tx.from || "modal");
  const [to, setTo] = useState(tx.to || "keuntungan");

  const numTotal = Number(String(total).replace(/\D/g, "")) || 0;
  const numHpp = Number(String(hpp).replace(/\D/g, "")) || 0;
  const numAmount = Number(String(amount).replace(/\D/g, "")) || 0;

  function handleSubmit() {
    const isoDate = new Date(dateVal).toISOString();
    let patch = { date: isoDate, note: note || null };
    if (tx.type === "penjualan") {
      patch = { ...patch, total: numTotal, hpp: numHpp, profit: numTotal - numHpp };
    } else if (tx.type === "pengeluaran") {
      patch = { ...patch, amount: numAmount, wallet };
    } else if (tx.type === "transfer") {
      patch = { ...patch, amount: numAmount, from, to };
    } else {
      patch = { ...patch, amount: numAmount };
    }
    onSubmit(patch);
  }

  return (
    <div className="mb-form">
      <label className="mb-form-label">Tanggal &amp; Waktu</label>
      <input
        type="datetime-local"
        className="mb-text-input"
        style={{ marginBottom: 16 }}
        value={dateVal}
        onChange={(e) => setDateVal(e.target.value)}
      />

      {tx.type === "penjualan" ? (
        <div className="mb-two-col" style={{ marginBottom: 16 }}>
          <div>
            <label className="mb-form-label">Total Penjualan</label>
            <div className="mb-amount-input">
              <span>Rp</span>
              <RupiahInput value={total} onChange={setTotal} />
            </div>
          </div>
          <div>
            <label className="mb-form-label">Modal (HPP)</label>
            <div className="mb-amount-input">
              <span>Rp</span>
              <RupiahInput value={hpp} onChange={setHpp} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <label className="mb-form-label">Jumlah</label>
          <div className="mb-amount-input" style={{ marginBottom: 16 }}>
            <span>Rp</span>
            <RupiahInput value={amount} onChange={setAmount} />
          </div>
        </>
      )}

      {tx.type === "pengeluaran" && (
        <>
          <label className="mb-form-label">Dompet</label>
          <div className="mb-segment" style={{ marginBottom: 16 }}>
            <button className={wallet === "modal" ? "active" : ""} onClick={() => setWallet("modal")}>Dompet Modal</button>
            <button className={wallet === "keuntungan" ? "active" : ""} onClick={() => setWallet("keuntungan")}>Dompet Keuntungan</button>
          </div>
        </>
      )}

      {tx.type === "transfer" && (
        <>
          <label className="mb-form-label">Arah Transfer</label>
          <div className="mb-segment" style={{ marginBottom: 16 }}>
            <button className={from === "modal" ? "active" : ""} onClick={() => { setFrom("modal"); setTo("keuntungan"); }}>Modal → Keuntungan</button>
            <button className={from === "keuntungan" ? "active" : ""} onClick={() => { setFrom("keuntungan"); setTo("modal"); }}>Keuntungan → Modal</button>
          </div>
        </>
      )}

      <label className="mb-form-label">Catatan</label>
      <input
        className="mb-text-input"
        style={{ marginBottom: 18 }}
        placeholder="Catatan (opsional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button className="mb-submit-btn" style={{ "--accent": "var(--gold)" }} onClick={handleSubmit}>
        Simpan Perubahan
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Screens                                                            */
/* ---------------------------------------------------------------- */

function Dashboard({ wallets, chartData, todayRevenue, todayCount, transactions }) {
  const dateStr = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="mb-screen">
      <div className="mb-greeting">
        <div className="mb-greeting-text">{getGreeting()}</div>
        <div className="mb-greeting-date">{dateStr}</div>
      </div>

      <div className="mb-balance-row">
        <div className="mb-balance-card modal">
          <div className="mb-balance-top"><Cat size={18} /><span>Modal</span></div>
          <div className="mb-balance-amount"><AnimatedNumber value={wallets.modal} /></div>
        </div>
        <div className="mb-balance-card keuntungan">
          <div className="mb-balance-top"><Coins size={18} /><span>Keuntungan</span></div>
          <div className="mb-balance-amount"><AnimatedNumber value={wallets.keuntungan} /></div>
        </div>
      </div>

      <div className="mb-stats-row">
        <div className="mb-stat-pill">
          <div className="mb-stat-label">Pendapatan hari ini</div>
          <div className="mb-stat-value">{rupiah(todayRevenue)}</div>
        </div>
        <div className="mb-stat-pill">
          <div className="mb-stat-label">Transaksi hari ini</div>
          <div className="mb-stat-value">{todayCount}</div>
        </div>
      </div>

      <div className="mb-card">
        <div className="mb-card-head">
          <h4>Arus Kas 7 Hari Terakhir</h4>
        </div>
        <div style={{ width: "100%", height: 150 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="gMasuk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gKeluar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--red)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--red)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v, n) => [rupiah(v), n === "masuk" ? "Masuk" : "Keluar"]}
                labelStyle={{ display: "none" }}
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, color: "var(--ink)" }}
              />
              <Area type="monotone" dataKey="masuk" stroke="var(--green)" strokeWidth={2} fill="url(#gMasuk)" />
              <Area type="monotone" dataKey="keluar" stroke="var(--red)" strokeWidth={2} fill="url(#gKeluar)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mb-legend">
          <span><i style={{ background: "var(--green)" }} />Masuk</span>
          <span><i style={{ background: "var(--red)" }} />Keluar</span>
        </div>
      </div>

      <div className="mb-card">
        <div className="mb-card-head"><h4>Transaksi Terbaru</h4></div>
        <TxList items={transactions} />
      </div>
    </div>
  );
}

function Kasir({ query, setQuery, category, setCategory, products, addToCart, onDeleteProduct, onOpenAdd }) {
  return (
    <div className="mb-screen">
      <div className="mb-search">
        <Search size={16} />
        <input placeholder="Cari produk..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="mb-chip-row">
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`mb-chip ${category === c.id ? "active" : ""}`} onClick={() => setCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="mb-product-grid">
        {products.map((p) => (
          <div key={p.id} className="mb-product-card" onClick={() => addToCart(p.id)}>
            <button
              className="mb-product-delete"
              onClick={(e) => { e.stopPropagation(); onDeleteProduct(p.id); }}
              aria-label="Hapus produk"
            >
              <X size={12} />
            </button>
            <div className="mb-product-glyph"><Glyph kind={p.kind} /></div>
            <div className="mb-product-name">{p.name}</div>
            <div className="mb-product-bottom">
              <span className="mb-product-price">{rupiah(p.price)}</span>
              <span className="mb-product-add"><Plus size={14} /></span>
            </div>
          </div>
        ))}
        <button className="mb-product-add-tile" onClick={onOpenAdd}>
          <Plus size={22} />
          <span>Tambah Produk</span>
        </button>
        {products.length === 0 && (
          <div className="mb-empty" style={{ gridColumn: "1 / -1" }}>
            <Search size={28} />
            <p>Produk tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Dompet({ wallets, walletTab, setWalletTab, walletTxs, onOpenSheet }) {
  return (
    <div className="mb-screen">
      <div className="mb-wallet-cards">
        <div className={`mb-wallet-card modal ${walletTab === "modal" ? "sel" : ""}`} onClick={() => setWalletTab("modal")}>
          <div className="mb-wallet-top"><Cat size={20} /><span>Dompet Modal</span></div>
          <div className="mb-wallet-balance"><AnimatedNumber value={wallets.modal} /></div>
        </div>
        <div className={`mb-wallet-card keuntungan ${walletTab === "keuntungan" ? "sel" : ""}`} onClick={() => setWalletTab("keuntungan")}>
          <div className="mb-wallet-top"><Coins size={20} /><span>Dompet Keuntungan</span></div>
          <div className="mb-wallet-balance"><AnimatedNumber value={wallets.keuntungan} /></div>
        </div>
      </div>

      <div className="mb-action-row">
        {walletTab === "modal" ? (
          <button className="mb-action-btn teal" onClick={() => onOpenSheet("addModal")}><ArrowDownLeft size={16} /> Setor Modal</button>
        ) : (
          <button className="mb-action-btn green" onClick={() => onOpenSheet("withdraw")}><ArrowUpRight size={16} /> Tarik Untung</button>
        )}
        <button className="mb-action-btn red" onClick={() => onOpenSheet("expense")}><Receipt size={16} /> Pengeluaran</button>
        <button className="mb-action-btn gold" onClick={() => onOpenSheet("transfer")}><ArrowLeftRight size={16} /> Transfer</button>
      </div>

      <div className="mb-card">
        <div className="mb-card-head"><h4>Riwayat {walletTab === "modal" ? "Dompet Modal" : "Dompet Keuntungan"}</h4></div>
        {walletTxs.length === 0 ? (
          <div className="mb-empty"><Wallet size={28} /><p>Belum ada transaksi</p></div>
        ) : (
          <div className="mb-tx-list">
            {walletTxs.map(({ tx, delta }) => {
              const meta = txMeta(tx);
              const Icon = meta.icon;
              return (
                <div className="mb-tx-row" key={tx.id + "-" + walletTab}>
                  <div className={`mb-tx-icon ${delta.dir}`}><Icon size={16} /></div>
                  <div className="mb-tx-info">
                    <div className="mb-tx-label">{meta.label}</div>
                    <div className="mb-tx-sub">{dateTimeLabel(tx.date)} · {meta.sub}</div>
                  </div>
                  <div className={`mb-tx-amount ${delta.dir}`}>{delta.dir === "in" ? "+" : "-"}{rupiah(delta.amount)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Riwayat({ grouped, isAdmin, onDelete, onEdit, onDeleteAll, onOpenSheet }) {
  return (
    <div className="mb-screen">
      <div className="mb-riwayat-head">
        <h3>Riwayat</h3>
        <button className="mb-iconbtn-lg" onClick={() => onOpenSheet("laporan")} aria-label="Buat laporan WhatsApp">
          <Share2 size={17} />
        </button>
      </div>
      {isAdmin && grouped.length > 0 && (
        <button className="mb-action-btn red" style={{ marginBottom: 14 }} onClick={onDeleteAll}>
          <X size={16} /> Hapus Semua Riwayat
        </button>
      )}
      {grouped.length === 0 && (
        <div className="mb-empty"><History size={28} /><p>Belum ada riwayat</p></div>
      )}
      {grouped.map(([key, txs]) => (
        <div key={key} className="mb-history-group">
          <div className="mb-history-label">{dateLabel(txs[0].date)}</div>
          <TxList items={txs} isAdmin={isAdmin} onDelete={onDelete} onEdit={onEdit} />
        </div>
      ))}
    </div>
  );
}

function TxList({ items, isAdmin, onDelete, onEdit }) {
  if (items.length === 0) return <div className="mb-empty"><Receipt size={26} /><p>Belum ada transaksi</p></div>;
  return (
    <div className="mb-tx-list">
      {items.map((tx) => {
        const meta = txMeta(tx);
        const Icon = meta.icon;
        return (
          <div className="mb-tx-row" key={tx.id}>
            <div className={`mb-tx-icon ${meta.dir}`}><Icon size={16} /></div>
            <div className="mb-tx-info">
              <div className="mb-tx-label">{meta.label}</div>
              <div className="mb-tx-sub">{dateTimeLabel(tx.date)} · {meta.sub}</div>
            </div>
            <div className={`mb-tx-amount ${meta.dir}`}>{meta.dir === "in" ? "+" : meta.dir === "out" ? "-" : ""}{rupiah(meta.amount)}</div>
            {isAdmin && onEdit && (
              <button className="mb-tx-edit" onClick={() => onEdit(tx)} aria-label="Edit riwayat">
                <Pencil size={13} />
              </button>
            )}
            {isAdmin && onDelete && (
              <button className="mb-tx-delete" onClick={() => onDelete(tx.id)} aria-label="Hapus riwayat">
                <X size={13} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

