import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField,
  Select, MenuItem, FormControl, InputLabel, Button,
  FormHelperText, Alert
} from "@mui/material";

const incomeCategories = ["salary", "freelance", "returns"];
const expenseCategories = [
  "grocery", "bill", "emi", "fees", "health",
  "transport", "entertainment", "investment", "other"
];

// mirrors your Joi schema
const validate = (values) => {
  const errors = {};

  // title
  if (!values.title || !values.title.trim()) {
    errors.title = "Title is required";
  }

  // amount
  if (values.amount === "" || values.amount === null) {
    errors.amount = "Amount is required";
  } else if (isNaN(values.amount)) {
    errors.amount = "Amount must be a number";
  } else if (Number(values.amount) <= 0) {
    errors.amount = "Amount must be a positive number";
  }

  // type
  if (!values.type) {
    errors.type = "Type is required";
  } else if (!["income", "expense"].includes(values.type)) {
    errors.type = "Type must be either income or expense";
  }

  // category
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

  // date - optional but validate if provided
  if (values.date && isNaN(new Date(values.date).getTime())) {
    errors.date = "Invalid date format";
  }

  // note - optional, no validation needed
  return errors;
};

function NewTransaction() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    title: "", amount: "", type: "", category: "", date: "", note: ""
  });

  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting]   = useState(false);

  // mark field as touched on blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(curr => ({ ...curr, [name]: true }));
    // validate on blur
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

    // clear error for field as user types
    if (touched[name]) {
      const errs = validate({ ...values, [name]: value });
      setErrors(errs);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // touch all fields on submit
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }), {}
    );
    setTouched(allTouched);

    const errs = validate(values);
    setErrors(errs);

    if (Object.keys(errs).length > 0) return; // stop if errors exist

    setSubmitting(true);
    setServerError("");

    try {
      const response = await fetch("/api/transactions/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...values,
          amount: Number(values.amount) // ensure number not string
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

  // helper: show error only if field is touched
  const showError = (field) => touched[field] && errors[field];

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight={600} mb={3}>
            New Transaction
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate // disable browser native validation
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
                {submitting ? "Creating..." : "CREATE"}
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

export default NewTransaction;