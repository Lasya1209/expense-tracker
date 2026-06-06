import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Typography, Card,
  CardContent, CardActions, Chip, Divider,
  Alert, FormHelperText, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearIcon from "@mui/icons-material/Clear";

const incomeCategories  = ["salary", "freelance", "returns"];
const expenseCategories = [
  "grocery", "bill", "emi", "fees", "health",
  "transport", "entertainment", "investment", "other"
];

const validateFilters = (filters) => {
  const errors = {};

  // date range: from must be before to
  if (filters.from && filters.to && filters.from > filters.to) {
    errors.to = "'To' date must be after 'From' date";
  }

  // amount range: min must be less than max
  if (
    filters.minAmount !== "" && filters.maxAmount !== "" &&
    Number(filters.minAmount) > Number(filters.maxAmount)
  ) {
    errors.maxAmount = "Max amount must be greater than min amount";
  }

  // negative amounts not allowed
  if (filters.minAmount !== "" && Number(filters.minAmount) < 0) {
    errors.minAmount = "Min amount cannot be negative";
  }
  if (filters.maxAmount !== "" && Number(filters.maxAmount) < 0) {
    errors.maxAmount = "Max amount cannot be negative";
  }

  // primary and secondary sort must be different
  if (
    filters.primarySort && filters.secondarySort &&
    filters.primarySort === filters.secondarySort
  ) {
    errors.secondarySort = "Secondary sort must differ from primary sort";
  }

  return errors;
};

function TransactionBox() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [filterErrors, setFilterErrors] = useState({});
  const [serverError, setServerError]   = useState("");

  // delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const [filters, setFilters] = useState({
    title: "", type: "", category: "",
    from: "", to: "", minAmount: "", maxAmount: "",
    primarySort: "", secondarySort: ""
  });

  useEffect(() => {
    getTransactions();
  }, []);

  const getTransactions = async () => {
    try {
      const response = await fetch("/api/transactions", { credentials: "include" });
      if (response.status === 401) { navigate("/users/login"); return; }
      const data = await response.json();
      setTransactions(data.transactions || []);
      setServerError("");

    } catch (err) {      
      console.error(err);
      setServerError("Failed to load transactions");
    }
  };

  const applyFilters = async (e) => {
    e.preventDefault();

    // validate before sending
    const errs = validateFilters(filters);
    setFilterErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const response = await fetch("/api/transactions/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
        credentials: "include"
      });
      if (response.status === 401) { navigate("/users/login"); return; }
      const data = await response.json();
      setTransactions(data.transactions || []);
      setServerError("");
    } catch (err) {
      console.error(err);
      setServerError("Failed to apply filters");
    }
  };

  const clearFilters = async () => {
    setFilters({
      title: "", type: "", category: "",
      from: "", to: "", minAmount: "", maxAmount: "",
      primarySort: "", secondarySort: ""
    });
    setFilterErrors({});
    setServerError("");
    await getTransactions();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = name === "type"
      ? { ...filters, type: value, category: "" }
      : { ...filters, [name]: value };

    setFilters(updated);

    // live re-validate on change
    const errs = validateFilters(updated);
    setFilterErrors(errs);
  };

  // open confirm dialog instead of window.alert
  const confirmDelete = (id) => setDeleteDialog({ open: true, id });

  const handleDelete = async () => {
    const id = deleteDialog.id;
    setDeleteDialog({ open: false, id: null });
    try {
      const response = await fetch(`/api/transactions/delete/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (response.status === 401) { navigate("/users/login"); return; }
      if (!response.ok) {
        setServerError("Failed to delete transaction");
        return;
      }
      setTransactions(curr => curr.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
      setServerError("Failed to delete transaction");
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Transactions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/transactions/new")}
        >
          New Transaction
        </Button>
      </Box>

      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setServerError("")}>
          {serverError}
        </Alert>
      )}

      {/* Filter Form */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          <FilterAltIcon fontSize="small" /> Filters
        </Typography>

        <Box component="form" onSubmit={applyFilters} noValidate>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-start" }}>

            {/* TITLE */}
            <TextField
              label="Search Title"
              name="title"
              size="small"
              value={filters.title}
              onChange={handleChange}
            />

            {/* TYPE */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={filters.type}
                label="Type"
                onChange={handleChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>

            {/* CATEGORY */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                label="Category"
                onChange={handleChange}
                disabled={!filters.type}
              >
                <MenuItem value="">All</MenuItem>
                {(filters.type === "income"
                  ? incomeCategories
                  : expenseCategories
                ).map((c) => (
                  <MenuItem key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* FROM DATE */}
            <TextField
              label="From Date"
              name="from"
              size="small"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={filters.from}
              onChange={handleChange}
            />

            {/* TO DATE */}
            <Box>
              <TextField
                label="To Date"
                name="to"
                size="small"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={filters.to}
                onChange={handleChange}
                error={!!filterErrors.to}
              />
              {filterErrors.to && (
                <FormHelperText error>{filterErrors.to}</FormHelperText>
              )}
            </Box>

            {/* MIN AMOUNT */}
            <Box>
              <TextField
                label="Min Amount"
                name="minAmount"
                size="small"
                type="number"
                value={filters.minAmount}
                onChange={handleChange}
                error={!!filterErrors.minAmount}
                slotProps={{ htmlInput: { min: 0 } }}
              />
              {filterErrors.minAmount && (
                <FormHelperText error>{filterErrors.minAmount}</FormHelperText>
              )}
            </Box>

            {/* MAX AMOUNT */}
            <Box>
              <TextField
                label="Max Amount"
                name="maxAmount"
                size="small"
                type="number"
                value={filters.maxAmount}
                onChange={handleChange}
                error={!!filterErrors.maxAmount}
                slotProps={{ htmlInput: { min: 0 } }}
              />
              {filterErrors.maxAmount && (
                <FormHelperText error>{filterErrors.maxAmount}</FormHelperText>
              )}
            </Box>

            {/* PRIMARY SORT */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Primary Sort</InputLabel>
              <Select
                name="primarySort"
                value={filters.primarySort}
                label="Primary Sort"
                onChange={handleChange}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="latest">Latest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="highest">Highest Amount</MenuItem>
                <MenuItem value="lowest">Lowest Amount</MenuItem>
              </Select>
            </FormControl>

            {/* SECONDARY SORT */}
            <Box>
              <FormControl
                size="small"
                sx={{ minWidth: 140 }}
                error={!!filterErrors.secondarySort}
              >
                <InputLabel>Secondary Sort</InputLabel>
                <Select
                  name="secondarySort"
                  value={filters.secondarySort}
                  label="Secondary Sort"
                  onChange={handleChange}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="latest">Latest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="highest">Highest Amount</MenuItem>
                  <MenuItem value="lowest">Lowest Amount</MenuItem>
                </Select>
                {filterErrors.secondarySort && (
                  <FormHelperText>{filterErrors.secondarySort}</FormHelperText>
                )}
              </FormControl>
            </Box>

          </Box>

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<FilterAltIcon />}
              disabled={Object.keys(filterErrors).length > 0}
            >
              Apply Filters
            </Button>
            <Button
              type="button"
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Clear
            </Button>
            <Button type="button" variant="outlined" onClick={getTransactions}>
              Get All
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Transaction List */}
      {transactions.length === 0
        ? (
          <Typography color="text.secondary" textAlign="center" mt={4}>
            No transactions found. Click "Get All" or add a new one.
          </Typography>
        )
        : transactions.map(t => (
          <Card key={t._id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="h6">{t.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(t.date).toLocaleDateString("en-IN")} · {t.category}
                  </Typography>
                  {t.note && (
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {t.note}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="h6"
                    color={t.type === "income" ? "success.main" : "error.main"}
                    fontWeight={600}
                  >
                    {t.type === "income" ? "+" : "-"}₹{t.amount}
                  </Typography>
                  <Chip
                    label={t.type}
                    size="small"
                    color={t.type === "income" ? "success" : "error"}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
            </CardContent>
            <Divider />
            <CardActions>
              <Button
                size="small"
                onClick={() => navigate(`/transactions/edit/${t._id}`)}
              >
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => confirmDelete(t._id)}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        ))
      }

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default TransactionBox;