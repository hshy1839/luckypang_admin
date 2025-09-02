import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  FaBoxOpen,
  FaTicketAlt,
  FaWonSign,
} from 'react-icons/fa';
import '../css/Main.css';

const COLORS = ['#00C49F', '#FF8042', '#0088FE'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('ko-KR').format(amount) + ' 원';

const Main = () => {
  const now = new Date();
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [paymentStats, setPaymentStats] = useState({ card: 0, mixed: 0, point: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [thisMonthOrderCount, setThisMonthOrderCount] = useState(0);
  const [revenueByDate, setRevenueByDate] = useState({ daily: [], monthly: [], yearly: [] });

  const [viewMode, setViewMode] = useState('daily');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchData = async () => {
      try {
        const [productRes, orderRes] = await Promise.all([
          axios.get('http://localhost:7778/api/products/allProduct', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:7778/api/orders', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (productRes.data.success) {
          setTotalProductsCount(productRes.data.products.length);
        }

        if (orderRes.data.success) {
          let monthlyTotal = 0;
          let orderCount = 0;

          const dailyMap = {};
          const monthlyMap = {};
          const yearlyMap = {};

          orderRes.data.orders.forEach((order) => {
            const date = new Date(order.createdAt);
            const amount = (order.paymentAmount || 0) + (order.pointUsed || 0);
            const type = order.paymentType?.toLowerCase();

            if (
              date.getMonth() === now.getMonth() &&
              date.getFullYear() === now.getFullYear()
            ) {
              monthlyTotal += amount;
              orderCount += 1;
            }

            const dayKey = date.toISOString().slice(0, 10);
            const monthKey = date.toISOString().slice(0, 7);
            const yearKey = date.getFullYear();

            const addToMap = (map, key) => {
              if (!map[key]) map[key] = { amount: 0, card: 0, point: 0, mixed: 0 };
              map[key].amount += amount;
              if (type === 'card') map[key].card += amount;
              if (type === 'point') map[key].point += amount;
              if (type === 'mixed') map[key].mixed += amount;
            };

            addToMap(dailyMap, dayKey);
            addToMap(monthlyMap, monthKey);
            addToMap(yearlyMap, yearKey);
          });

          const toArray = (map) =>
            Object.entries(map)
              .map(([date, value]) => ({ date, ...value }))
              .sort((a, b) => new Date(a.date) - new Date(b.date));

          setMonthlyRevenue(monthlyTotal);
          setThisMonthOrderCount(orderCount);
          setPaymentStats({
            card: Object.values(dailyMap).reduce((sum, d) => sum + (d.card || 0), 0),
            mixed: Object.values(dailyMap).reduce((sum, d) => sum + (d.mixed || 0), 0),
            point: Object.values(dailyMap).reduce((sum, d) => sum + (d.point || 0), 0),
          });
          setRevenueByDate({
            daily: toArray(dailyMap),
            monthly: toArray(monthlyMap),
            yearly: toArray(yearlyMap),
          });
        }
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
      }
    };

    fetchData();
  }, []);

  const kpis = [
    {
      label: '이번 달 매출',
      value: formatCurrency(monthlyRevenue),
      icon: <FaWonSign />, bg: 'main-section1-item-circle4',
    },
    {
      label: '이번 달 결제 건수',
      value: `${thisMonthOrderCount} 건`,
      icon: <FaTicketAlt />, bg: 'main-section1-item-circle1',
    },
    {
      label: '상품 개수',
      value: totalProductsCount,
      icon: <FaBoxOpen />, bg: 'main-section1-item-circle2',
    },
  ];

  const filteredRevenue = revenueByDate[viewMode].filter((item) => {
    const date = new Date(item.date);
    if (viewMode === 'daily') {
      return date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth;
    }
    if (viewMode === 'monthly') {
      return date.getFullYear() === selectedYear;
    }
    return true;
  });

  const pieData = [
    { name: '카드', value: paymentStats.card },
    { name: '혼합', value: paymentStats.mixed },
    { name: '포인트', value: paymentStats.point },
  ];

  const totalPie = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="main-container">
      <div className="main-container-header">
        <h1>통계</h1>
      </div>

      <div className="main-container-container">
        <div className="main-section1">
          <div className="main-section1-item-container">
            {kpis.map((kpi, idx) => (
              <div className="main-section1-item" key={idx}>
                <div className="main-section1-item-text">{kpi.label}</div>
                <div className="main-section1-item-percent">
                  <div className={kpi.bg}><span>{kpi.icon}</span></div>
                  <div className="main-section1-item-detail">{kpi.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="main-section2">
          <div className="main-section2-graph">
            <div className="main-section2-graph-top-container">
              <div className="main-section2-graph-title">결제 수단 비율</div>
            </div>
            <div className="main-section2-graph-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${formatCurrency(value)} (${((value / (totalPie || 1)) * 100).toFixed(1)}%)`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="main-section2-graph">
            <div className="main-section2-graph-top-container">
              <div className="main-section2-graph-title">매출 추이</div>
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                <option value="daily">일별</option>
                <option value="monthly">월별</option>
                <option value="yearly">연도별</option>
              </select>
              {viewMode === 'daily' && (
                <>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                    {[...Array(5)].map((_, i) => {
                      const year = now.getFullYear() - i;
                      return <option key={year} value={year}>{year}년</option>;
                    })}
                  </select>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}월</option>
                    ))}
                  </select>
                </>
              )}
              {viewMode === 'monthly' && (
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                  {[...Array(5)].map((_, i) => {
                    const year = now.getFullYear() - i;
                    return <option key={year} value={year}>{year}년</option>;
                  })}
                </select>
              )}
            </div>

            <div className="main-section2-graph-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ background: '#fff', border: '1px solid #ccc', padding: 10 }}>
                            <strong>{label}</strong>
                            <p>금액: {formatCurrency(data.amount)}</p>
                            <p>카드: {formatCurrency(data.card || 0)}</p>
                            <p>포인트: {formatCurrency(data.point || 0)}</p>
                            <p>혼합: {formatCurrency(data.mixed || 0)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
