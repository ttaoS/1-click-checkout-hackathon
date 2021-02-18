import React, {Component} from 'react';
import HomePage from "../components/Home";
import * as queryString from "querystring";

class Home extends Component {
    constructor(props) {
        super(props);
        let url = this.props.location.search.slice(1);
        let params = queryString.parse(url);

        this.state = {
            data: {
                shoppingCart: {
                    sku: params.sku,
                    name: params.name,
                    quantity: params.quantity,
                    price: params.price,
                    image: params.image
                },
                name:'test user name',
                shippingAddress: 'test shipping address'
            }
        };
    }

    render() {
            return <HomePage data={this.state.data}/>;
    };
};

export default Home;