import React, {Component} from 'react';
import CheckoutPage from "../components/Checkout";
import * as queryString from "querystring";

class Home extends Component {
    constructor(props) {
        super(props);
        let url = this.props.location.search.slice(1);
        let { product } = queryString.parse(url);
        const { sku, attribues, qty } = JSON.parse(product);
        let merchantDomain = "http://10.41.10.23"; // window.parent.location.origin;

        this.state = {
            sku,
            qty,
            attribues,
            merchantDomain
        };
    }

    render() {
            return <CheckoutPage {...this.state}/>;
    };
};

export default Home;