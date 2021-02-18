import React from 'react';
import headerStyles from '../css/header.module.css';
import labelValueStyles from '../css/label-value.module.css';
import inputStyles from '../css/input-text.module.css';
import ShoppingCart from "./ShoppingCart";

const HomePage = (props) => {
    const customerId = "5201314";
    const customerHeader = <p>Customer info:</p>;
    const nameInput =
        <label>
            <span className={labelValueStyles.label}>Name</span>
            <input type='text'
                   name='name'
                   value={props.data.name}
                   className={inputStyles.root}
            />
        </label>;
    const contactInput =
        <label>
            <span className={labelValueStyles.label}>Email</span>
            <input type='text'
                   name='email'
                   value='test'
                   className={inputStyles.root}
            />
        </label>;
    const shippingAddressInput =
        <label>
            <span className={labelValueStyles.label}>Shipping address</span>
            <input type='text'
                   name='shippingAddress'
                   value={props.data.shippingAddress}
                   className={inputStyles.root}
            />
        </label>;

    const placeOrder = async () => {
        const response = await fetch("https://zip-api-shipping.labs.au.edge.zip.co/order", {
            body: JSON.stringify({
                "Amount": 100,
                "CheckoutId": "co_112312312",
                "MerchantId": "m_123131321",
                "CustomerId": customerId,
                "OrderItems": [{
                    "Name" : "World of Warcraft",
                    "Amount" : 100
                }],
                "ShippingAddress": {
                    "AddressLine1" : "7 George Street",
                    "PostalCode" : "2010",
                    "State" : "NSW",
                    "Suburb" : "Sydney"
                }
            })
        });

        const order = await response.json();

        // success
        if (order.ChargeId) {
            window.parent.postMessage(
                {
                    event: 'complete',
                    orderId: order.OrderId,
                    chargeId: order.ChargeId,
                },
                '*',
            );
        }
    }

    const submitButton = <button type="button" class="btn btn-primary" onClick={placeOrder}>Primary</button>;

    return (
        <>
            <ShoppingCart data={props.data.shoppingCart}/>
            <hr></hr>
            <br></br>
            {customerHeader}
            <br></br>
            {nameInput}
            {contactInput}
            {shippingAddressInput}
            {submitButton}
        </>
    );
};

export default HomePage;