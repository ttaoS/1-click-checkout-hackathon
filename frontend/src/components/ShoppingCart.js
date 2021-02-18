import React from 'react';
import labelValueStyles from '../css/label-value.module.css';
import inputStyles from '../css/input-text.module.css';

const ShoppingCart = () => {

    const shoppingCart =
        <label>
            <span className={labelValueStyles.label}>Shopping Cart</span>
            <input type='text'
                   name='name'
                   value='tony tao'
                   className={inputStyles.root}
            />
        </label>;

    return (
        <>
            {shoppingCart}
        </>
    );
};

export default ShoppingCart;