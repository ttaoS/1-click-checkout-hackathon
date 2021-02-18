import React, {Component} from 'react';
import styles from '../css/app.module.css';
import {classes} from '../domain/format';
import HomePage from "../components/Home";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: { name: 'test'}
        };

        console.log(this.props);
    }

    render() {
        return <>
            <div className={classes(styles.appBody, [styles.padded, true])}>
                <HomePage data={this.state.data}/>
            </div>
        </>;
    };
};

export default App;