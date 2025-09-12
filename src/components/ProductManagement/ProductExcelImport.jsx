// components/ProductManagement/ProductExcelImport.jsx
import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

export default function ProductExcelImport({
  apiBase = 'http://13.124.224.246:7778',
  createPath = '/api/products/productCreate',
  onDone,
}) {
  const inputRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [preview, setPreview] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ total: 0, success: 0, fail: 0 });
  const [results, setResults] = useState([]);

  const token = (function () {
    const raw = localStorage.getItem('token');
    return raw && raw !== 'undefined' && raw !== 'null' ? raw : '';
  })();

  const normalizeBool = (v) => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (['true', 't', 'y', 'yes', '1', 'on'].includes(s)) return true;
      if (['false', 'f', 'n', 'no', '0', 'off'].includes(s)) return false;
    }
    return false;
  };

  const toNumber = (v) => {
    if (v === undefined || v === null || v === '') return 0;
    const n = Number(String(v).replace(/[,\s]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  const pick = (obj, key) => (obj?.[key] ?? obj?.[key.toLowerCase()] ?? obj?.[key.toUpperCase()]);

  const parseSheet = async (file) => {
    setParsing(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets['products'] || wb.Sheets[wb.SheetNames[0]];
      if (!ws) throw new Error('시트를 찾을 수 없습니다. (products 시트 권장)');

      const json = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
      if (!Array.isArray(json) || json.length === 0) throw new Error('데이터 행이 없습니다.');

      const norm = json.map((r, idx) => {
        const _r = Object.fromEntries(
          Object.entries(r).map(([k, v]) => [k.trim(), typeof v === 'string' ? v.trim() : v])
        );
        const row = {
          name: pick(_r, 'name') || pick(_r, '상품명') || '',
          consumerPrice: toNumber(pick(_r, 'consumerPrice') ?? pick(_r, '소비자가격')),
          price: toNumber(pick(_r, 'price') ?? pick(_r, '판매가')),
          brand: pick(_r, 'brand') ?? pick(_r, '브랜드') ?? '',
          category: pick(_r, 'category') ?? pick(_r, '박스종류') ?? '',
          shippingFee: toNumber(pick(_r, 'shippingFee') ?? pick(_r, '배송비')),
          probability: pick(_r, 'probability') ?? pick(_r, '확률') ?? '',
          description: pick(_r, 'description') ?? pick(_r, '설명') ?? '',
          sourceLink: pick(_r, 'sourceLink') ?? pick(_r, '소스링크') ?? '',
          isSourceSoldOut: normalizeBool(pick(_r, 'isSourceSoldOut') ?? pick(_r, '원소스품절')),
        };
        return {
          __row: idx + 2,
          ...row,
          __errors: [
            !row.name && 'name 누락',
            !row.consumerPrice && 'consumerPrice 누락',
            !row.price && 'price 누락',
          ].filter(Boolean),
        };
      });

      setRows(norm);
      setPreview(norm.slice(0, 20));
    } catch (e) {
      alert(`엑셀 파싱 실패: ${e?.message || e}`);
      setRows([]);
      setPreview([]);
    } finally {
      setParsing(false);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    parseSheet(f);
  };

  const openPicker = () => inputRef.current?.click();

  const generateTemplate = () => {
    const headers = [
      ['name*', 'consumerPrice*', 'price*', 'brand', 'category', 'shippingFee', 'probability', 'description', 'sourceLink', 'isSourceSoldOut (TRUE/FALSE)'],
    ];
    const example = [
      ['샘플 상품 A', 49000, 39000, '브랜드A', '5000', 3000, '5%', '간단 설명', 'https://example.com/item/123', 'FALSE'],
      ['샘플 상품 B', 129000, 99000, '브랜드B', '10000', 3500, '10%', '상세 설명', 'https://example.com/item/456', 'TRUE'],
    ];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'products');
    XLSX.writeFile(wb, 'product_import_template.xlsx');
  };

  const submitAll = async () => {
    if (!token) return alert('토큰이 없습니다. 로그인 상태를 확인하세요.');
    if (rows.length === 0) return alert('업로드할 데이터가 없습니다.');

    const validRows = rows.map((r, idx) => ({ ...r, __idx: idx })).filter((r) => r.__errors.length === 0);
    const errorRows = rows.filter((r) => r.__errors.length > 0);
    if (errorRows.length > 0 && !window.confirm(`유효성 오류가 있는 ${errorRows.length}행을 건너뛰고 진행할까요?`)) return;

    setSubmitting(true);
    setProgress({ total: validRows.length, success: 0, fail: 0 });
    setResults([]);

    const endpoint = apiBase.replace(/\/$/, '') + createPath;

    for (let i = 0; i < validRows.length; i++) {
      const r = validRows[i];
      try {
        const fd = new FormData();
        fd.append('name', r.name);
        fd.append('brand', r.brand);
        fd.append('category', r.category);
        fd.append('probability', r.probability);
        fd.append('consumerPrice', String(r.consumerPrice));
        fd.append('price', String(r.price));
        fd.append('shippingFee', String(r.shippingFee));
        fd.append('option', '');
        fd.append('description', r.description);
        fd.append('sourceLink', r.sourceLink);
        fd.append('isSourceSoldOut', String(!!r.isSourceSoldOut));

        const res = await axios.post(endpoint, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res?.data?.success) {
          setProgress((p) => ({ ...p, success: p.success + 1 }));
          setResults((arr) => arr.concat({ index: r.__row, status: 'success', productId: res.data?.product?._id, message: '' }));
        } else {
          setProgress((p) => ({ ...p, fail: p.fail + 1 }));
          setResults((arr) => arr.concat({ index: r.__row, status: 'fail', message: res?.data?.message || '등록 실패' }));
        }
      } catch (e) {
        setProgress((p) => ({ ...p, fail: p.fail + 1 }));
        setResults((arr) => arr.concat({ index: r.__row, status: 'fail', message: e?.response?.data?.message || e?.message || '에러' }));
      }
    }

    setSubmitting(false);
    if (typeof onDone === 'function') onDone();
  };

  const progressRatio = progress.total ? (progress.success + progress.fail) / progress.total : 0;

  return (
    <div className="excel-import card">
      <div className="excel-import__header">
        <div>
          <h2 className="title">엑셀 업로드로 대량 등록</h2>
          <p className="subtitle">템플릿으로 내보내고, 파일 선택 후 업로드하세요.</p>
        </div>
        <div className="excel-import__actions">
          <button className="btn ghost" onClick={generateTemplate}>🧩 템플릿</button>
          <button className="btn" onClick={openPicker}>📁 파일 선택</button>
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFile} />
          <button className="btn primary" disabled={!rows.length || parsing || submitting} onClick={submitAll}>
            {submitting ? '업로드 중…' : '⬆️ 일괄 등록'}
          </button>
        </div>
      </div>

      {(rows.length > 0 || parsing || submitting) && (
        <div className="status-bar">
          <span className="badge">총 {rows.length}행</span>
          <span className="badge success">유효 {rows.filter(r=>r.__errors.length===0).length}</span>
          <span className="badge danger">오류 {rows.filter(r=>r.__errors.length>0).length}</span>
          {parsing && <span className="badge neutral">파싱 중…</span>}
          {submitting && (
            <>
              <span className="badge neutral">진행 {progress.success + progress.fail}/{progress.total}</span>
              <div className="progress">
                <div className="progress__bar" style={{ width: `${Math.round(progressRatio*100)}%` }} />
              </div>
            </>
          )}
        </div>
      )}

      {preview.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#(엑셀행)</th>
                <th>name</th>
                <th>consumerPrice</th>
                <th>price</th>
                <th>brand</th>
                <th>category</th>
                <th>shippingFee</th>
                <th>probability</th>
                <th>isSourceSoldOut</th>
                <th>오류</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i}>
                  <td>{r.__row}</td>
                  <td className="text-ellipsis" title={r.name}>{r.name}</td>
                  <td>{r.consumerPrice}</td>
                  <td>{r.price}</td>
                  <td className="text-ellipsis" title={r.brand}>{r.brand}</td>
                  <td className="text-ellipsis" title={r.category}>{r.category}</td>
                  <td>{r.shippingFee}</td>
                  <td>{r.probability}</td>
                  <td>
                    <span className={`pill ${r.isSourceSoldOut ? 'danger' : 'success'}`}>
                      {String(r.isSourceSoldOut)}
                    </span>
                  </td>
                  <td className="text-danger">{r.__errors.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 20 && <p className="muted">※ 미리보기는 20행까지만 표시됩니다.</p>}
        </div>
      )}

      {results.length > 0 && (
        <div className="results card--soft">
          <h3 className="title-sm">등록 결과</h3>
          <table className="table compact">
            <thead>
              <tr>
                <th>엑셀행</th>
                <th>상태</th>
                <th>메시지/ID</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.index}</td>
                  <td>
                    <span className={`pill ${r.status === 'success' ? 'success' : 'danger'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className={r.status === 'success' ? 'text-muted' : 'text-danger'}>
                    {r.status === 'success' ? (r.productId || '') : (r.message || '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---- New Polished Styles ---- */}
      <style jsx>{`
        :root {
          --bg: #0b0f14;
          --panel: #0f172a;
          --panel-soft: #0f172a14;
          --border: #1f2937;
          --text: #e5e7eb;
          --muted: #9ca3af;
          --primary: #2563eb;
          --primary-600: #1d4ed8;
          --success: #16a34a;
          --danger: #ef4444;
          --neutral: #64748b;
          --shadow: 0 8px 24px rgba(0,0,0,.25);
        }

        .card {
          margin-top: 24px;
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: linear-gradient(180deg, #0b1324, #0b0f14);
          box-shadow: var(--shadow);
        }
        .card--soft {
          background: var(--panel-soft);
          border: 1px dashed #2a3544;
        }

        .excel-import__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .title {
          margin: 0 0 4px;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: .2px;
        }
        .title-sm {
          margin: 0 0 10px;
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
        }
        .subtitle {
          margin: 0;
          font-size: 13px;
          color: var(--muted);
        }

        .excel-import__actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btn {
          padding: 9px 12px;
          border-radius: 10px;
          border: 1px solid #24324a;
          background: #121a2a;
          color: var(--text);
          cursor: pointer;
          transition: transform .06s ease, background .2s ease, border-color .2s ease;
        }
        .btn:hover { transform: translateY(-1px); border-color: #2e415f; }
        .btn:active { transform: translateY(0); }
        .btn.primary { background: var(--primary); border-color: var(--primary-600); }
        .btn.primary:disabled { opacity: .55; cursor: not-allowed; }
        .btn.ghost { background: transparent; border-color: #334155; }

        .status-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 14px;
        }
        .badge {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 999px;
          background: #0b1628;
          border: 1px solid #1c2a44;
          color: var(--text);
        }
        .badge.success { background: rgba(22,163,74,.12); border-color: rgba(22,163,74,.35); }
        .badge.danger { background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.35); }
        .badge.neutral { background: rgba(100,116,139,.12); border-color: rgba(100,116,139,.35); }

        .progress {
          position: relative;
          flex: 1 1 160px;
          height: 8px;
          background: #101725;
          border: 1px solid #1e293b;
          border-radius: 999px;
          overflow: hidden;
          min-width: 160px;
        }
        .progress__bar {
          height: 100%;
          background: linear-gradient(90deg, var(--primary) 0%, #60a5fa 100%);
          width: 0%;
          transition: width .25s ease;
        }

        .table-wrap {
          margin-top: 14px;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          background: #0b0f14;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .table thead th {
          background: #0f172a;
          color: var(--text);
          text-align: left;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .table tbody td {
          padding: 10px 12px;
          border-top: 1px solid #10182833;
          color: var(--text);
        }
        .table tbody tr:nth-child(even) { background: #0b111c; }
        .table tbody tr:hover { background: #0c1524; }

        .table.compact thead th,
        .table.compact tbody td { padding: 8px 10px; }

        .text-ellipsis {
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .text-danger { color: var(--danger); }
        .text-muted { color: var(--muted); }

        .pill {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
          border: 1px solid #2b3b5a;
          background: #0f172a;
          color: var(--text);
        }
        .pill.success { background: rgba(22,163,74,.12); border-color: rgba(22,163,74,.35); color: #a7f3d0; }
        .pill.danger { background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.35); color: #fecaca; }

        .muted { margin: 8px 0 0; color: var(--muted); font-size: 12px; }

        @media (max-width: 960px) {
          .text-ellipsis { max-width: 140px; }
          .excel-import__actions { width: 100%; justify-content: flex-start; }
        }
      `}</style>
    </div>
  );
}
