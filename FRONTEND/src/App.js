import React from "react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Login from "./components/login";
import AddMedicine from "./components/addmedicine";
import Sidebar from "./components/sidebar";
import StockDetailsPage from "./components/stock";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route path="/sidebar" component={Sidebar}/>
        <Route path="/addmedicine" component={AddMedicine} />
        <Route path="/stock" component={StockDetailsPage} />
      </Switch>
    </Router>
  );
};

export default App;
