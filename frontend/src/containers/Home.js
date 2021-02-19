import React, {Component} from 'react';
import CheckoutPage from "../components/Checkout";

class Home extends Component {
    constructor(props) {
        super(props);
        let url = this.props.location.search.slice(1);
        const params = new URLSearchParams (url);
        const { sku, attributes, qty } = JSON.parse(params.get("product"));
        let merchantDomain = "http://10.41.10.23"; // window.parent.location.origin;

        this.state = {
            sku,
            qty,
            attributes,
            merchantDomain
        };

        console.log(this.state);
    }

    render() {
            return <CheckoutPage {...this.state}/>;
    };
};

export default Home;