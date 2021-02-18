import React, {Component} from 'react';
import styles from '../css/app.module.css';
import {classes} from '../domain/format';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import Home from "./Home";

class App extends Component {
    render() {
        return <>
            <div className={classes(styles.appBody, [styles.padded, true])}>
                <Router>
                <Switch>
                    <Route exact path="/checkout" component={Home}>
                    </Route>
                    <Route exact path="/test">
                        <>test</>
                    </Route>
                </Switch>
                </Router>
            </div>
        </>;
    };
};

export default App;