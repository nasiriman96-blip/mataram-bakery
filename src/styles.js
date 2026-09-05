export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; }
html, body { margin:0; padding:0; }
button, input, select, textarea {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  -webkit-tap-highlight-color: transparent;
}

.mb-outer {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .4s ease;
  overflow: hidden;
  background: var(--bg);
  color: var(--ink);
}

.mb-outer.light {
  --bg: #F6EEE0; --surface: #FFFDF8; --surface-2: #EFE3CB; --border: #E1D3B4;
  --ink: #2A1F1A; --ink-soft: #7A6A57;
  --gold: #B3812F; --gold-soft: #EFDDB0;
  --teal: #1F5C56; --teal-soft: #D9EAE7;
  --green: #3F6B4A; --green-soft: #DCE9DD;
  --red: #A8462F; --red-soft: #F3DED8;
  --shadow: 0 18px 40px rgba(42,31,26,0.16);
}
.mb-outer.dark {
  --bg: #1C1410; --surface: #241A14; --surface-2: #2E2117; --border: #3D2E22;
  --ink: #F1E7D9; --ink-soft: #B4A28A;
  --gold: #E0A94D; --gold-soft: #4A3A24;
  --teal: #5FB8AC; --teal-soft: #24413D;
  --green: #8FB768; --green-soft: #33402A;
  --red: #E07456; --red-soft: #45291F;
  --shadow: 0 18px 40px rgba(0,0,0,0.55);
}

.mb-app {
  width: 100%; max-width: 100%; height: 100%;
  background: var(--bg); color: var(--ink);
  border-radius: 0; box-shadow: none; border: none;
  display: flex; flex-direction: column; overflow: hidden; position: relative;
  transition: background .4s ease, color .4s ease, border-color .4s ease;
}

.mb-header { display:flex; align-items:center; justify-content:space-between; padding: 18px 20px 12px; }
.mb-brand { display:flex; align-items:center; gap:10px; }
.mb-logo { width:36px; height:36px; border-radius:11px; background: var(--gold); color: var(--surface); font-family:'Fraunces',serif; font-weight:600; font-size:19.5px; display:flex; align-items:center; justify-content:center; }
.mb-brand-name { font-family:'Fraunces',serif; font-weight:600; font-size:18px; line-height:1.15; }
.mb-brand-sub { font-size:13px; color: var(--ink-soft); }
.mb-toggle { width:34px; height:34px; border-radius:50%; border:1px solid var(--border); background: var(--surface); color: var(--ink); display:flex; align-items:center; justify-content:center; cursor:pointer; transition: transform .2s ease, background .3s ease; }
.mb-toggle:active { transform: scale(0.9); }
.mb-toggle-icon.spin { animation: spinIn .4s ease; }
@keyframes spinIn { from { transform: rotate(-90deg); opacity:0; } to { transform: rotate(0); opacity:1; } }

.mb-content { flex:1; overflow-y:auto; padding: 4px 20px 90px; scrollbar-width:none; }
.mb-content::-webkit-scrollbar { display:none; }
.mb-fade { animation: fadeSlideUp .35s cubic-bezier(.4,0,.2,1); }
@keyframes fadeSlideUp { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform: translateY(0);} }

.mb-screen { display:flex; flex-direction:column; gap:16px; padding-top: 6px; }

.mb-greeting-text { font-family:'Fraunces',serif; font-size:21.5px; font-weight:600; }
.mb-greeting-date { font-size:14px; color: var(--ink-soft); margin-top:2px; }

.mb-balance-row { display:flex; gap:12px; }
.mb-balance-card { flex:1; border-radius:20px; padding:16px; color:#fff; position:relative; overflow:hidden; }
.mb-balance-card.modal { background: linear-gradient(135deg, var(--teal), #163f3b); }
.mb-balance-card.keuntungan { background: linear-gradient(135deg, var(--green), #274d31); }
.mb-balance-top { display:flex; align-items:center; gap:6px; font-size:14px; opacity:.9; margin-bottom:10px; }
.mb-balance-amount { font-family:'Fraunces',serif; font-size:20.5px; font-weight:600; }

.mb-stats-row { display:flex; gap:12px; }
.mb-stat-pill { flex:1; background: var(--surface); border:1px solid var(--border); border-radius:16px; padding:12px 14px; }
.mb-stat-label { font-size:12.5px; color: var(--ink-soft); margin-bottom:4px; }
.mb-stat-value { font-weight:700; font-size:16px; }

.mb-card { background: var(--surface); border:1px solid var(--border); border-radius:20px; padding:16px; }
.mb-card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.mb-card-head h4 { margin:0; font-size:15.5px; font-weight:700; }
.mb-legend { display:flex; gap:16px; margin-top:6px; font-size:13px; color: var(--ink-soft); }
.mb-legend span { display:flex; align-items:center; gap:5px; }
.mb-legend i { width:8px; height:8px; border-radius:50%; display:inline-block; }

.mb-tx-list { display:flex; flex-direction:column; gap:4px; }
.mb-tx-row { display:flex; align-items:center; gap:11px; padding:9px 2px; border-bottom:1px solid var(--border); }
.mb-tx-row:last-child { border-bottom:none; }
.mb-tx-icon { width:34px; height:34px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.mb-tx-icon.in { background: var(--green-soft); color: var(--green); }
.mb-tx-icon.out { background: var(--red-soft); color: var(--red); }
.mb-tx-icon.neutral { background: var(--gold-soft); color: var(--gold); }
.mb-tx-info { flex:1; min-width:0; }
.mb-tx-label { font-size:14.5px; font-weight:600; }
.mb-tx-sub { font-size:12.5px; color: var(--ink-soft); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.mb-tx-amount { font-size:14.5px; font-weight:700; white-space:nowrap; }
.mb-tx-amount.in { color: var(--green); }
.mb-tx-amount.out { color: var(--red); }
.mb-tx-amount.neutral { color: var(--gold); }

.mb-search { display:flex; align-items:center; gap:8px; background: var(--surface); border:1px solid var(--border); border-radius:14px; padding:10px 13px; color: var(--ink-soft); }
.mb-search input { border:none; outline:none; background:transparent; font-size:15px; color: var(--ink); flex:1; font-family:inherit; }

.mb-chip-row { display:flex; gap:8px; overflow-x:auto; padding-bottom:2px; scrollbar-width:none; }
.mb-chip-row::-webkit-scrollbar { display:none; }
.mb-chip { flex-shrink:0; border:1px solid var(--border); background: var(--surface); color: var(--ink-soft); border-radius:100px; padding:7px 13px; font-size:14px; font-weight:600; cursor:pointer; transition: all .2s ease; font-family:inherit; }
.mb-chip.active { background: var(--gold); border-color: var(--gold); color: var(--surface); }
.mb-chip:active { transform: scale(0.94); }

.mb-product-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.mb-product-card { text-align:left; background: var(--surface); border:1px solid var(--border); border-radius:18px; padding:14px; cursor:pointer; transition: transform .15s ease, box-shadow .15s ease; font-family:inherit; }
.mb-product-card:active { transform: scale(0.96); }
.mb-product-glyph { width:44px; height:44px; border-radius:13px; background: var(--gold-soft); color: var(--gold); display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
.mb-product-name { font-size:14px; font-weight:700; line-height:1.3; margin-bottom:10px; min-height:38px; }
.mb-product-bottom { display:flex; align-items:center; justify-content:space-between; }
.mb-product-price { font-size:13.5px; font-weight:700; color: var(--gold); }
.mb-product-add { width:26px; height:26px; border-radius:50%; background: var(--gold); color: var(--surface); display:flex; align-items:center; justify-content:center; }

.mb-cartbar { position:absolute; left:16px; right:16px; bottom:82px; background: var(--ink); color: var(--bg); border:none; border-radius:16px; padding:13px 16px; display:flex; align-items:center; gap:10px; cursor:pointer; box-shadow: 0 10px 24px rgba(0,0,0,0.25); animation: popScale .3s cubic-bezier(.34,1.56,.64,1); font-family:inherit; font-size:14.5px; font-weight:600; }
.mb-cartbar-count { background: var(--gold); color:#2a1f1a; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; }
.mb-cartbar-total { margin-left:auto; }
@keyframes popScale { from { opacity:0; transform: translateY(14px) scale(0.95);} to { opacity:1; transform: translateY(0) scale(1);} }

.mb-nav { display:flex; border-top:1px solid var(--border); background: var(--surface); padding: 8px 6px calc(env(safe-area-inset-bottom, 0px) + 8px); position:relative; }
.mb-nav-indicator { position:absolute; top:6px; height:calc(100% - 12px); width:25%; background: var(--gold-soft); border-radius:14px; transition: left .35s cubic-bezier(.4,0,.2,1); z-index:0; }
.mb-navitem { position:relative; z-index:1; flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:8px 0; background:none; border:none; color: var(--ink-soft); cursor:pointer; font-family:inherit; font-size:12px; font-weight:600; transition: color .25s ease; }
.mb-navitem.active { color: var(--gold); }

.mb-backdrop { position:absolute; inset:0; background: rgba(0,0,0,0.5); display:flex; align-items:flex-end; z-index:20; animation: backdropIn .25s ease; }
@keyframes backdropIn { from{opacity:0} to{opacity:1} }
.mb-sheet { width:100%; max-height:85%; background: var(--bg); border-radius:24px 24px 0 0; padding:10px 20px 26px; overflow-y:auto; animation: sheetUp .35s cubic-bezier(.4,0,.2,1); }
@keyframes sheetUp { from { transform: translateY(100%);} to { transform: translateY(0);} }
.mb-sheet-handle { width:36px; height:4px; background: var(--border); border-radius:100px; margin: 4px auto 12px; }
.mb-sheet-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.mb-sheet-head h3 { margin:0; font-family:'Fraunces',serif; font-size:18.5px; font-weight:600; }
.mb-iconbtn { width:30px; height:30px; border-radius:50%; border:1px solid var(--border); background: var(--surface); color: var(--ink); display:flex; align-items:center; justify-content:center; cursor:pointer; }

.mb-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:34px 0; color: var(--ink-soft); text-align:center; }
.mb-empty p { margin:0; font-size:14px; }

.mb-cart-list { display:flex; flex-direction:column; gap:10px; max-height:260px; overflow-y:auto; margin-bottom:12px; }
.mb-cart-row { display:flex; align-items:center; gap:11px; }
.mb-cart-glyph { width:38px; height:38px; border-radius:11px; background: var(--gold-soft); color: var(--gold); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.mb-cart-info { flex:1; min-width:0; }
.mb-cart-name { font-size:14px; font-weight:700; }
.mb-cart-price { font-size:13px; color: var(--ink-soft); }
.mb-qty { display:flex; align-items:center; gap:9px; background: var(--surface-2); border-radius:100px; padding:5px 10px; }
.mb-qty button { width:20px; height:20px; border-radius:50%; border:none; background: var(--surface); color: var(--ink); display:flex; align-items:center; justify-content:center; cursor:pointer; }
.mb-qty span { font-size:14px; font-weight:700; min-width:14px; text-align:center; }

.mb-cart-summary { border-top:1px solid var(--border); padding-top:12px; }
.mb-summary-row { display:flex; justify-content:space-between; font-size:14.5px; font-weight:600; margin-bottom:6px; }
.mb-summary-row.muted { color: var(--ink-soft); font-weight:500; font-size:13.5px; }

.mb-submit-btn { width:100%; margin-top:10px; padding:14px; border:none; border-radius:15px; background: var(--accent, var(--gold)); color:#fff; font-weight:700; font-size:15px; cursor:pointer; transition: transform .15s ease, opacity .2s ease; font-family:inherit; }
.mb-submit-btn:active { transform: scale(0.97); }
.mb-submit-btn:disabled { opacity:.45; cursor:not-allowed; }

.mb-success { display:flex; flex-direction:column; align-items:center; text-align:center; padding: 6px 0 4px; }
.mb-check-circle { animation: checkPop .5s cubic-bezier(.34,1.56,.64,1); margin-bottom:12px; }
@keyframes checkPop { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
.mb-check-path { stroke-dasharray: 40; stroke-dashoffset:40; animation: dashDraw .5s .15s ease forwards; }
@keyframes dashDraw { to { stroke-dashoffset:0; } }
.mb-success h3 { font-family:'Fraunces',serif; margin:2px 0 6px; font-size:18.5px; }
.mb-success-total { font-size:23.5px; font-weight:700; color: var(--gold); margin:0 0 10px; }
.mb-success-split { display:flex; gap:14px; font-size:13px; color: var(--ink-soft); margin-bottom:6px; }

.mb-form { display:flex; flex-direction:column; }
.mb-form-helper { font-size:13px; color: var(--ink-soft); margin:-2px 0 10px; }
.mb-form-label { font-size:13px; font-weight:700; color: var(--ink-soft); margin-bottom:6px; }
.mb-amount-input { display:flex; align-items:center; gap:6px; background: var(--surface); border:1.5px solid var(--border); border-radius:14px; padding:12px 14px; margin-bottom:10px; transition: border-color .2s ease; }
.mb-amount-input:focus-within { border-color: var(--accent, var(--gold)); }
.mb-amount-input span { color: var(--ink-soft); font-weight:600; font-size:15.5px; }
.mb-amount-input input { border:none; outline:none; background:transparent; font-size:17.5px; font-weight:700; color: var(--ink); width:100%; font-family:inherit; }
.mb-quick-row { display:flex; gap:8px; margin-bottom:14px; }
.mb-text-input { border:1.5px solid var(--border); background: var(--surface); border-radius:14px; padding:11px 14px; font-size:14.5px; color: var(--ink); margin-bottom:6px; font-family:inherit; outline:none; }
.mb-text-input:focus { border-color: var(--gold); }

.mb-segment { display:flex; background: var(--surface-2); border-radius:14px; padding:4px; margin-bottom:14px; }
.mb-segment button { flex:1; border:none; background:transparent; padding:9px 6px; font-size:13px; font-weight:700; color: var(--ink-soft); border-radius:11px; cursor:pointer; font-family:inherit; transition: all .2s ease; }
.mb-segment button.active { background: var(--surface); color: var(--ink); box-shadow: 0 2px 6px rgba(0,0,0,0.08); }

.mb-wallet-cards { display:flex; gap:12px; }
.mb-wallet-card { flex:1; border-radius:18px; padding:15px; cursor:pointer; border:2px solid transparent; transition: all .25s ease; color:#fff; }
.mb-wallet-card.modal { background: linear-gradient(135deg, var(--teal), #163f3b); }
.mb-wallet-card.keuntungan { background: linear-gradient(135deg, var(--green), #274d31); }
.mb-wallet-card.sel { border-color: var(--gold); transform: translateY(-2px); }
.mb-wallet-top { display:flex; align-items:center; gap:6px; font-size:13.5px; opacity:.9; margin-bottom:9px; }
.mb-wallet-balance { font-family:'Fraunces',serif; font-size:18px; font-weight:600; }

.mb-action-row { display:flex; gap:8px; }
.mb-action-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; padding:11px 4px; border-radius:15px; border:1px solid var(--border); background: var(--surface); font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition: transform .15s ease; }
.mb-action-btn:active { transform: scale(0.94); }
.mb-action-btn.teal { color: var(--teal); }
.mb-action-btn.green { color: var(--green); }
.mb-action-btn.red { color: var(--red); }
.mb-action-btn.gold { color: var(--gold); }

.mb-history-group { display:flex; flex-direction:column; gap:6px; }
.mb-history-label { font-size:13px; font-weight:700; color: var(--ink-soft); margin: 4px 2px; }


.mb-product-card { position: relative; }
.mb-product-delete {
  position: absolute; top: 8px; right: 8px; width: 22px; height: 22px; border-radius: 50%;
  background: var(--red-soft); color: var(--red); display: flex; align-items: center; justify-content: center;
  z-index: 2; transition: transform .15s ease;
}
.mb-product-delete:active { transform: scale(0.85); }

.mb-product-add-tile {
  border: 1.5px dashed var(--border); border-radius: 18px; background: transparent; color: var(--ink-soft);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  min-height: 132px; cursor: pointer; font-size: 13.5px; font-weight: 700; transition: all .2s ease;
}
.mb-product-add-tile:active { transform: scale(0.96); }
.mb-product-add-tile:hover { border-color: var(--gold); color: var(--gold); }

.mb-glyph-picker { display:flex; gap:8px; margin-bottom:14px; }
.mb-glyph-option { flex:1; padding:12px 4px; border-radius:14px; border:1.5px solid var(--border); background: var(--surface); color: var(--ink-soft); display:flex; align-items:center; justify-content:center; cursor:pointer; transition: all .2s ease; }
.mb-glyph-option.active { border-color: var(--gold); color: var(--gold); background: var(--gold-soft); }

.mb-cat-picker { display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; }
.mb-cat-picker button { border:1.5px solid var(--border); background: var(--surface); color: var(--ink-soft); border-radius:100px; padding:8px 13px; font-size:13.5px; font-weight:600; cursor:pointer; transition: all .2s ease; }
.mb-cat-picker button.active { background: var(--gold); border-color: var(--gold); color: #fff; }

.mb-two-col { display:flex; gap:10px; }
.mb-two-col > div { flex:1; }

/* Tambahan: tombol hapus riwayat (khusus admin) */
.mb-tx-row { position: relative; }
.mb-tx-delete {
  width: 26px; height: 26px; border-radius: 50%; background: var(--red-soft); color: var(--red);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 6px;
  transition: transform .15s ease;
}
.mb-tx-delete:active { transform: scale(0.85); }
.mb-tx-edit {
  width: 26px; height: 26px; border-radius: 50%; background: var(--gold-soft); color: var(--gold);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 6px;
  transition: transform .15s ease;
}
.mb-tx-edit:active { transform: scale(0.85); }

/* Tambahan: badge admin di header */
.mb-admin-badge {
  font-size: 11px; font-weight: 700; color: var(--gold); background: var(--gold-soft);
  padding: 4px 10px; border-radius: 100px;
}

/* Tambahan: layar login/daftar */
.mb-auth-screen { display:flex; flex-direction:column; justify-content:center; height:100%; padding: 28px 24px; overflow-y:auto; }
.mb-auth-logo { width:52px; height:52px; border-radius:16px; background: var(--gold); color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Fraunces',serif; font-weight:700; font-size:22px; margin-bottom:16px; }
.mb-auth-title { font-family:'Fraunces',serif; font-size:22px; font-weight:600; margin: 0 0 4px; }
.mb-auth-sub { font-size:13.5px; color: var(--ink-soft); margin: 0 0 22px; }
.mb-auth-error { font-size:13px; color: var(--red); background: var(--red-soft); border-radius:12px; padding:10px 12px; margin-bottom:12px; }
.mb-auth-success { font-size:13px; color: var(--green); background: var(--green-soft); border-radius:12px; padding:10px 12px; margin-bottom:12px; }
.mb-auth-switch { text-align:center; font-size:13.5px; color: var(--ink-soft); margin-top:16px; }
.mb-auth-switch button { color: var(--gold); font-weight:700; cursor:pointer; }

/* Tambahan: pratinjau laporan WhatsApp */
.mb-laporan-preview {
  background: var(--surface-2); border: 1px solid var(--border); border-radius: 14px;
  padding: 12px 14px; font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
  font-size: 12.5px; line-height: 1.55; white-space: pre-wrap; word-break: break-word;
  color: var(--ink); max-height: 260px; overflow-y: auto; margin-bottom: 14px;
}

/* Tambahan: header Riwayat + tombol share laporan */
.mb-riwayat-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
.mb-riwayat-head h3 { margin:0; font-family:'Fraunces',serif; font-size:19px; font-weight:600; }
.mb-iconbtn-lg {
  width:36px; height:36px; border-radius:50%; background: var(--gold-soft); color: var(--gold);
  display:flex; align-items:center; justify-content:center; cursor:pointer; transition: transform .15s ease;
}
.mb-iconbtn-lg:active { transform: scale(0.9); }
`;
