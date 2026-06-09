import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField,
  Select, MenuItem, FormControl, InputLabel, Button,
  FormHelperText, Alert, CircularProgress
} from "@mui/material";
const beUrl = import.meta.env.VITE_API_URL;
const incomeCategories  = ["salary", "freelance", "returns"];
const expenseCategories = [
  "grocery", "bill", "emi", "fees", "health",
  "transport", "entertainment", "investment", "other"
];
const validate = (values) => {
  const errors = {};

  if (!values.title || !values.title.trim()) {
    errors.title = "Title is required";
  }

  if (values.amount === "" || values.amount === null) {
    errors.amount = "Amount is required";
  } else if (isNaN(values.amount)) {
    errors.amount = "Amount must be a number";
  } else if (Number(values.amount) <= 0) {
    errors.amount = "Amount must be a positive number";
  }

  if (!values.type) {
    errors.type = "Type is required";
  } else if (!["income", "expense"].includes(values.type)) {
    errors.type = "Type must be either income or expense";
  }

  const validCategories = [
    "salary", "freelance", "returns", "grocery", "bill",
    "emi", "fees", "health", "transport", "entertainment",
    "investment", "other"
  ];
  if (!values.category) {
    errors.category = "Category is required";
  } else if (!validCategories.includes(values.category)) {
    errors.category = "Invalid category";
  }

  if (values.date && isNaN(new Date(values.date).getTime())) {
    errors.date = "Invalid date format";
  }

  return errors;
};

function EditTransaction() {
  const navigate  = useNavigate();
  const { id }    = useParams();

  const [values, setValues]         = useState({
    title: "", amount: "", type: "", category: "", date: "", note: ""
  });
  const [errors, setErrors]         = useState({});
  const [touched, setTouched]       = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading]       = useState(true);  // for initial fetch

  // fetch existing transaction
  useEffect(() => {
    async function getTransaction() {
      try {
        const response = await fetch(`${beUrl}/api/transactions/${id}`, {
          credentials: "include"
        });

        if (response.status === 401) {
          navigate("/users/login");
          return;
        }

        const data = await response.json();
        const t    = data.transaction;

        if (t.date) t.date = t.date.split("T")[0];

        setValues({
          title:    t.title    || "",
          amount:   t.amount   || "",
          type:     t.type     || "",
          category: t.category || "",
          date:     t.date     || "",
          note:     t.note     || ""
        });
      } catch (err) {
        console.error(err);
        setServerError("Failed to load transaction");
      } finally {
        setLoading(false);
      }
    }
    getTransaction();
  }, [id]);

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(curr => ({ ...curr, [name]: true }));
    const errs = validate({ ...values });
    setErrors(errs);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setValues(curr => ({ ...curr, type: value, category: "" }));
    } else {
      setValues(curr => ({ ...curr, [name]: value }));
    }

    if (touched[name]) {
      const errs = validate({ ...values, [name]: value });
      setErrors(errs);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // touch all fields
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }), {}
    );
    setTouched(allTouched);

    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setServerError("");

    try {
      const response = await fetch(`${beUrl}/api/transactions/edit/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...values,
          amount: Number(values.amount)
        })
      });

      if (response.status === 401) {
        navigate("/users/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || "Something went wrong");
        return;
      }

      navigate("/transactions");
    } catch (err) {
      console.error(err);
      setServerError("Network error, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const showError = (field) => touched[field] && errors[field];

  // show spinner while fetching existing data
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Edit Transaction
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* TITLE */}
            <TextField
              label="Title"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!showError("title")}
              helperText={showError("title")}
              required
              fullWidth
            />

            {/* AMOUNT */}
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={values.amount}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!showError("amount")}
              helperText={showError("amount")}
              slotProps={{ htmlInput: { min: 0.01, step: "0.01" } }}
              required
              fullWidth
            />

            {/* TYPE */}
            <FormControl fullWidth required error={!!showError("type")}>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={values.type}
                label="Type"
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <MenuItem value="">Select type</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
              {showError("type") && (
                <FormHelperText>{errors.type}</FormHelperText>
              )}
            </FormControl>

            {/* CATEGORY */}
            <FormControl fullWidth required error={!!showError("category")}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={values.category}
                label="Category"
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!values.type}
              >
                <MenuItem value="">Select category</MenuItem>
                {(values.type === "income"
                  ? incomeCategories
                  : values.type === "expense"
                  ? expenseCategories
                  : []
                ).map((c) => (
                  <MenuItem key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </MenuItem>
                ))}
              </Select>
              {showError("category") && (
                <FormHelperText>{errors.category}</FormHelperText>
              )}
            </FormControl>

            {/* DATE */}
            <TextField
              label="Date"
              name="date"
              type="date"
              value={values.date}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!showError("date")}
              helperText={showError("date")}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />

            {/* NOTE */}
            <TextField
              label="Note"
              name="note"
              value={values.note}
              onChange={handleChange}
              onBlur={handleBlur}
              multiline
              rows={3}
              fullWidth
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting}
              >
                {submitting ? "Updating..." : "UPDATE"}
              </Button>
              <Button
                type="button"
                variant="outlined"
                fullWidth
                onClick={() => navigate("/transactions")}
              >
                CANCEL
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default EditTransaction;