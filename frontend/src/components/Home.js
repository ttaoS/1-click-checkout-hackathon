import React from 'react';
import headerStyles from '../css/header.module.css';
import labelValueStyles from '../css/label-value.module.css';
import inputStyles from '../css/input-text.module.css';
import ShoppingCart from "./ShoppingCart";

const HomePage = (props) => {

    const header = <p className={headerStyles.header}>1 click checkout</p>;
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
                   value={props.contact}
                   className={inputStyles.root}
            />
        </label>;
    const shippingAddressInput =
        <label>
            <span className={labelValueStyles.label}>Shipping address</span>
            <input type='text'
                   name='shippingAddress'
                   value={props.shippingAddress}
                   className={inputStyles.root}
            />
        </label>;

    return (
        <>
            {header}
            <ShoppingCart/>
            {nameInput}
            {contactInput}
            {shippingAddressInput}
        </>
    );
};

export default HomePage;