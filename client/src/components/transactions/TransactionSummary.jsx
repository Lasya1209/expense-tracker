import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Divider,
  Alert, Skeleton, Chip
} from "@mui/material";
import TrendingUpIcon    from "@mui/icons-material/TrendingUp";
import TrendingDownIcon  from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid, Cell
} from "recharts";

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun",
                    "Jul","Aug","Sep","Oct","Nov","Dec"];

// category color map for bar chart
const CATEGORY_COLORS = {
  salary:        "#22c55e",
  freelance:     "#16a34a",
  returns:       "#4ade80",
  grocery:       "#f97316",
  bill:          "#ef4444",
  emi:           "#dc2626",
  fees:          "#f59e0b",
  health:        "#ec4899",
  transport:     "#8b5cf6",
  entertainment: "#06b6d4",
  investment:    "#6366f1",
  other:         "#94a3b8",
};

// custom tooltip for bar chart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: "background.paper", border: "1px solid",
        borderColor: "divider", borderRadius: 1, p: 1.5
      }}>
        <Typography variant="body2" fontWeight={600}>
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </Typography>
        <Typography variant="body2" color="primary">
          ₹{payload[0].value.toLocaleString("en-IN")}
        </Typography>
      </Box>
    );
  }
  return null;
};

// custom tooltip for line chart
const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: "background.paper", border: "1px solid",
        borderColor: "divider", borderRadius: 1, p: 1.5
      }}>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        <Typography variant="body2" color="success.main">
          Income: ₹{payload.find(p => p.dataKey === "income")?.value?.toLocaleString("en-IN") ?? 0}
        </Typography>
        <Typography variant="body2" color="error.main">
          Expense: ₹{payload.find(p => p.dataKey === "expense")?.value?.toLocaleString("en-IN") ?? 0}
        </Typography>
      </Box>
    );
  }
  return null;
};

// skeleton for summary cards while loading
const SummaryCardSkeleton = () => (
  <Card sx={{ flex: 1, minWidth: 200 }}>
    <CardContent>
      <Skeleton width="60%" height={20} />
      <Skeleton width="80%" height={40} />
    </CardContent>
  </Card>
);

function TransactionSummary() {
  const navigate = useNavigate();

  const [summary, setSummary]                 = useState({ income: 0, expense: 0, balance: 0 });
  const [categorySummary, setCategorySummary] = useState([]);
  const [monthlySummary, setMonthlySummary]   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sRes, cRes, mRes] = await Promise.all([
          fetch("/api/transactions/summary",          { credentials: "include" }),
          fetch("/api/transactions/category-summary", { credentials: "include" }),
          fetch("/api/transactions/monthly-summary",  { credentials: "include" }),
        ]);

        // check for 401 on any request
        if ([sRes, cRes, mRes].some(r => r.status === 401)) {
          navigate("/users/login");
          return;
        }

        if (!sRes.ok || !cRes.ok || !mRes.ok) {
          setError("Failed to load summary data");
          return;
        }

        const [s, c, m] = await Promise.all([sRes.json(), cRes.json(), mRes.json()]);
        setSummary(s);
        setCategorySummary(c);
        setMonthlySummary(m);
      } catch (err) {
        console.error(err);
        setError("Network error, please try again");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // monthly chart now shows income vs expense as two lines
  const monthlyChartData = monthlySummary.map(item => ({
    name:    `${monthNames[item._id.month - 1]} ${item._id.year}`,
    income:  item.income  ?? 0,
    expense: item.expense ?? 0,
  }));

  const savingsRate = summary.income > 0
    ? (((summary.income - summary.expense) / summary.income) * 100).toFixed(1)
    : 0;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>

      <Typography variant="h5" fontWeight={600} mb={3}>Summary</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        {loading
          ? [1, 2, 3, 4].map(i => <SummaryCardSkeleton key={i} />)
          : <>
              <Card sx={{ flex: 1, minWidth: 200 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <TrendingUpIcon color="success" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">Total Income</Typography>
                  </Box>
                  <Typography variant="h5" color="success.main" fontWeight={600}>
                    ₹{summary.income&&(summary.income.toLocaleString("en-IN"))||0}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1, minWidth: 200 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <TrendingDownIcon color="error" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">Total Expenses</Typography>
                  </Box>
                  <Typography variant="h5" color="error.main" fontWeight={600}>
                    ₹{(summary.expense&&summary.expense.toLocaleString("en-IN"))||0}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1, minWidth: 200 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <AccountBalanceIcon
                      color={summary.balance >= 0 ? "success" : "error"}
                      fontSize="small"
                    />
                    <Typography variant="body2" color="text.secondary">Balance</Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    color={summary.balance >= 0 ? "success.main" : "error.main"}
                    fontWeight={600}
                  >
                    ₹{(summary.balance&&summary.balance.toLocaleString("en-IN"))||0}
                  </Typography>
                </CardContent>
              </Card>

              {/* savings rate bonus card */}
              <Card sx={{ flex: 1, minWidth: 200 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Savings Rate
                  </Typography>
                  <Typography
                    variant="h5"
                    color={Number(savingsRate) >= 20 ? "success.main" : "warning.main"}
                    fontWeight={600}
                  >
                    {savingsRate}%
                  </Typography>
                  <Chip
                    label={Number(savingsRate) >= 20 ? "On Track" : "Needs Attention"}
                    size="small"
                    color={Number(savingsRate) >= 20 ? "success" : "warning"}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </>
        }
      </Box>

      {/* Bar Chart — Spending by Category */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Typography variant="h6" mb={2}>Spending by Category</Typography>
        {loading
          ? <Skeleton variant="rectangular" height={300} />
          : categorySummary.length === 0
            ? <Typography color="text.secondary" textAlign="center" py={4}>No data yet</Typography>
            : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categorySummary} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => `₹${v}`} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Amount">
                    {categorySummary.map(entry => (
                      <Cell
                        key={entry._id}
                        fill={CATEGORY_COLORS[entry._id] || "#94a3b8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
        }
      </Card>

      {/* Line Chart — Income vs Expense Monthly */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Typography variant="h6" mb={2}>Monthly Income vs Expense</Typography>
        {loading
          ? <Skeleton variant="rectangular" height={300} />
          : monthlyChartData.length === 0
            ? <Typography color="text.secondary" textAlign="center" py={4}>No data yet</Typography>
            : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => `₹${v}`} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Legend />
                  <Line
                    type="monotone" dataKey="income"
                    stroke="#22c55e" strokeWidth={2}
                    dot={{ r: 4 }} name="Income"
                  />
                  <Line
                    type="monotone" dataKey="expense"
                    stroke="#ef4444" strokeWidth={2}
                    dot={{ r: 4 }} name="Expense"
                  />
                </LineChart>
              </ResponsiveContainer>
            )
        }
      </Card>

      {/* Category Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Category Breakdown</Typography>
          {loading
            ? [1,2,3].map(i => <Skeleton key={i} height={40} />)
            : categorySummary.length === 0
              ? <Typography color="text.secondary">No data yet</Typography>
              : categorySummary.map(item => (
                <Box key={item._id}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{
                        width: 12, height: 12, borderRadius: "50%",
                        bgcolor: CATEGORY_COLORS[item._id] || "#94a3b8"
                      }} />
                      <Typography>
                        {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {/* % of total expenses */}
                      <Typography variant="body2" color="text.secondary">
                        {summary.expense > 0
                          ? ((item.total / summary.expense) * 100).toFixed(1)
                          : 0
                        }%
                      </Typography>
                      <Typography fontWeight={600}>
                        ₹{item.total.toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                </Box>
              ))
          }
        </CardContent>
      </Card>

      {/* Monthly Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>Monthly Breakdown</Typography>
          {loading
            ? [1,2,3].map(i => <Skeleton key={i} height={40} />)
            : monthlySummary.length === 0
              ? <Typography color="text.secondary">No data yet</Typography>
              : monthlySummary.map(item => (
                <Box key={`${item._id.month}-${item._id.year}`}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, alignItems: "center" }}>
                    <Typography>
                      {monthNames[item._id.month - 1]} {item._id.year}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 3 }}>
                      <Typography variant="body2" color="success.main">
                        +₹{(item.income ?? 0).toLocaleString("en-IN")}
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        -₹{(item.expense ?? 0).toLocaleString("en-IN")}
                      </Typography>
                      <Typography fontWeight={600}
                        color={(item.income ?? 0) >= (item.expense ?? 0) ? "success.main" : "error.main"}
                      >
                        ₹{((item.income ?? 0) - (item.expense ?? 0)).toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                </Box>
              ))
          }
        </CardContent>
      </Card>

    </Box>
  );
}

export default TransactionSummary;