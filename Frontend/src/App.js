import React from "react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Login from "./components/login";
import AddMedicine from "./components/addmedicine";
import Sidebar from "./components/sidebar";
import StockDetailsPage from "./components/stock";
import Billing from "./components/billing";
import Purchase from "./components/purchase";
import BillingHis from "./components/billinghistory";
import RegistrationForm from "./components/registration";
import StockDetailsPage1 from "./components/pharmacystock";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css'


const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route path="/sidebar" component={Sidebar}/>
        <Route path="/addmedicine" component={AddMedicine} />
        <Route path="/register" component={RegistrationForm} />
        <Route path="/stock" component={StockDetailsPage} />
        <Route path="/pharmacystock" component={StockDetailsPage1} />
        <Route path="/billing" component={Billing} />
        <Route path="/purchase" component={Purchase} />
        <Route path="/billinghistory" component={BillingHis} />
      </Switch>
    </Router>
  );
};

export default App;
