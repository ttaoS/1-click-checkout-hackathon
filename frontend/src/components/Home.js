import React, {useState} from 'react';
import labelValueStyles from '../css/label-value.module.css';
import inputStyles from '../css/input-text.module.css';
import ShoppingCart from "./ShoppingCart";
import {FormControl, Input, InputLabel, makeStyles, MenuItem, Select} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1)
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

const HomePage = (props) => {
    const customerId = "5201314";
    const customerHeader = <p>Customer info:</p>;
    const classes = useStyles();
    let [address, setAddress] =  useState({});
    const handleAddressChange = (event) => {
        setAddress(event.target.value);
    };
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
                   value={props.data.email}
                   className={inputStyles.root}
            />
        </label>;
    
    const shippingAddressInput =
        <>
            <FormControl className={classes.formControl}>
                <InputLabel id="shipping-address-label">Shipping Address</InputLabel>
                <Select
                    labelId="shipping-address-label"
                    id="shipping-address"
                    value={address}
                    onChange={handleAddressChange}
                    input={<Input />}
                >
                    {props.data.shippingAddress.map((address, indexx) => (
                        <MenuItem key={indexx} value={address}>
                            {address.addressLine1 + " " + address.addressLine2 + " " + address.city + " "  + address.postalCode + " " + address.regionCode}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </>


    const placeOrder = async () => {
        const response = await fetch("https://zip-api-shipping.labs.au.edge.zip.co/order", {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Amount": props.data.shoppingCart.price,
                "CheckoutId": "co_cvqado1012m11",
                "MerchantId": "m_iuqnooihqwe12",
                "CustomerId": customerId,
                "OrderItems": [{
                    "Name" :  props.data.shoppingCart.name,
                    "Amount" :  props.data.shoppingCart.price,
                    "Sku" :  props.data.shoppingCart.sku,
                    "Quantity" :  props.data.shoppingCart.quantity
                }],
                "ShippingAddress": address
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
            <ShoppingCart data={{...props.data.shoppingCart, shippingAddress: props.data.shippingAddress}}/>
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