import React, {Component, useEffect} from 'react';
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
                    quantity: parseInt(params.quantity),
                    price: parseFloat(params.price),
                    image: params.image
                },
                name: '',
                email: '',
                shippingAddress: []
            }
        };
    }

    componentDidMount() {
        this.getShippingAddresses().then((rsp) =>{
            this.setState({...this.state, data : {... this.state.data, shippingAddress: rsp.shippingAddresses } } );

            this.setState({...this.state, data : {... this.state.data, shippingAddress: rsp.shippingAddresses } } );
        })
        this.getCustomer().then((rsp) =>{
            this.setState({...this.state, data : {... this.state.data, name: rsp.firstName + " " + rsp.lastName } } );

            this.setState({...this.state, data : {... this.state.data, email: rsp.email } } );
        })
    }


    getShippingAddresses = async ()=> {
        const response = await fetch(`https://zip-api-shipping.labs.au.edge.zip.co/shipping?customerId=5201314`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }

    getCustomer = async ()=> {
        const response = await fetch(`https://zip-api-shipping.labs.au.edge.zip.co/customer?customerId=5201314`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }

    render() {
            return <HomePage data={this.state.data}/>;
    };
};

export default Home;