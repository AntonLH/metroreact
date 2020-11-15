import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './styles/index.scss';
import App from './components/App';
import ScrollToTop from './components/ScrollToTop';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <BrowserRouter>
      <ScrollToTop />
      <App />
  </BrowserRouter>,
  document.getElementById("root")
);

serviceWorker.unregister();
