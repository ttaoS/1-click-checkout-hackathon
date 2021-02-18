import React from 'react';
import labelValueStyles from '../css/label-value.module.css';
import inputStyles from '../css/input-text.module.css';

const ShoppingCart = (props) => {
    const header = <p >Shopping cart:</p>;
    const sku =
        <label>
            <span className={labelValueStyles.label}>sku</span>
            <input type='text'
                   name='sku'
                   value={props.data.sku}
                   className={inputStyles.root}
            />
        </label>;
    const name =
        <label>
            <span className={labelValueStyles.label}>name</span>
            <input type='text'
                   name='name'
                   value={props.data.name}
                   className={inputStyles.root}
            />
        </label>;

    const quantity =
        <label>
            <span className={labelValueStyles.label}>quantity</span>
            <input type='text'
                   name='quantity'
                   value={props.data.quantity}
                   className={inputStyles.root}
            />
        </label>;
    const price =
        <label>
            <span className={labelValueStyles.label}>price</span>
            <input type='text'
                   name='price'
                   value={props.data.price}
                   className={inputStyles.root}
            />
        </label>;

    return (
        <div>
            {header}
            <br></br>
            {name}
            {sku}
            {quantity}
            {price}
            <br></br>
        </div>
    );
};

export default ShoppingCart;