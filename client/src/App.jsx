import './App.css';
import TransactionBox from './components/transactions/TransactionBox.jsx';
import NewTransaction from './components/transactions/NewTransaction.jsx';
import EditTransaction from './components/transactions/EditTransaction.jsx';
import TransactionSummary from './components/transactions/TransactionSummary.jsx';
import User from './components/users/User.jsx';
import SignUp from './components/users/SignUp.jsx';
import Login from './components/users/Login.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Navbar from "./components/NavBar.jsx";
import AuthContext from "./context/AuthContext.jsx";
import { BrowserRouter,Routes, Route,Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
function App(){
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);
     useEffect(() => {
    fetch("/api/users/current-user", {
        credentials: "include"
    })
     .then(res => res.json())
    .then(data => {
        if (data.success) {
            setUser(data.user);
        }else{
          setUser(null);
        }
    }).catch(err=>{
      console.err(err);
      setUser(null);
    }
    ) .finally(() => setLoading(false));;
}, []);
if (loading) return <div>Loading...</div>;
  return (
  <AuthContext.Provider value={{ user, setUser }}>
    <BrowserRouter>
       <Navbar /> 
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/transactions" replace />} />

        {/* Public routes */}
        <Route path="/users/login"  element={<Login />} />
        <Route path="/users/signup" element={<SignUp />} />
        <Route path="/users"        element={<User />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/transactions"          element={<TransactionBox />} />
          <Route path="/transactions/new"      element={<NewTransaction />} />
          <Route path="/transactions/edit/:id" element={<EditTransaction />} />
          <Route path="/transactions/summary"  element={<TransactionSummary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthContext.Provider>
);
}
export default App;