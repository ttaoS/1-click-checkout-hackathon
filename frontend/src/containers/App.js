import React, {Component} from 'react';
import styles from '../css/app.module.css';
import {classes} from '../domain/format';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import Home from "./Home";
import { Global, ThemeProvider } from '@zip/components';

class App extends Component {
    render() {
        return <>
            <ThemeProvider>
                <Global />
                <Router>
                <Switch>
                    <Route exact path="/" component={Home}>
                    </Route>
                </Switch>
                </Router>
            </ThemeProvider>
        </>;
    };
};

export default App;