import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ButtonBase from '@material-ui/core/ButtonBase';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    avatar: {
        marginBottom: '20px'
    },
    paper: {
        padding: theme.spacing(2),
        margin: 'auto',
        maxWidth: 500,
    },
    image: {
        width: 128,
        height: 128,
    },
    img: {
        margin: 'auto',
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
    },
  }));

const CheckoutPage = ({ sku, merchantDomain }) => {
    const [quoteId, setQuoteId] = useState(null);
    const [item, setItem] = useState({ name: 'test', price: 20 });
    const [addresses, setAddresses] = useState([]);
    const [shippingMethods, setShippingMethods] =  useState([]);
    const [billingAddress, setBillingAddress] = useState(null);
    const [shippingAddress, setShippingAddress] = useState(null);
    const [shippingMethod, setShippingMethod] =  useState(null);
    const [customer, setCustomer] = useState(null);
    const classes = useStyles();

    const token = "qr9u7c8goinkrvxksv54vthimr8ezjz2";
    const customerId = "5201314";
    const apiDomain = "https://zip-api-shipping.labs.au.edge.zip.co";
    const merchantApiPostSettings = {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    };


    useEffect(() => {
        retrieveCartItem();
        retrieveAddresses();
        retrieveCustomerDetails();
    });

    const retrieveCartItem = async () => {
        const createCartResponse = await fetch(`${merchantDomain}/rest/V1/guest-carts`, merchantApiPostSettings);
        const quoteId = await createCartResponse.json();
        setQuoteId(quoteId);
        const retrieveCartResponse = await fetch(`${merchantDomain}/rest/V1/guest-carts/${quoteId}`);
        const cart = await retrieveCartResponse.json();
        const cartId = cart.id;

        const addItemResponse = await fetch(`${merchantDomain}/rest/V1/guest-carts/${cartId}/items`, {
            ...merchantApiPostSettings,
            body: JSON.stringify({
                cartItem: {
                sku,
                qty: 1,
                quote_id: quoteId
                }
            }) 
        });

        const item = addItemResponse.json();
        setItem(item);
    }

    const retrieveAddresses = async () => {
        const addressesResponse = await fetch(`${apiDomain}/shipping?customerId=${customerId}`);
        const { shippingAddresses } = await addressesResponse.json();
        setAddresses(shippingAddresses);
    }

    const retrieveCustomerDetails = async () => {
        const customerResponse = await fetch(`${apiDomain}/customer?customerId=${customerId}`);
        const customer = await customerResponse.json();
        setCustomer(customer);
    }

    const retrieveShippingMethods = async (address)=> {
        const shippingMethodsResponse = await fetch(`${merchantDomain}/rest/V1/guest-carts/${quoteId}/estimate-shipping-methods`, {
            ...merchantApiPostSettings,
            body: JSON.stringify({
                address
            }) 
        });
        const shippingMethods = await shippingMethodsResponse.json();
        setShippingMethods(shippingMethods);
    }

    const createOrder = async () => {
        // save billing address
        await fetch(`${merchantDomain}/rest/V1/guest-carts/${quoteId}/billing-address`, {
            ...merchantApiPostSettings,
            body: JSON.stringify({
                address: billingAddress
            }) 
        });

        // save shipping address and method
        await fetch(`${merchantDomain}/rest/V1/guest-carts/${quoteId}/shipping-information`, {
            ...merchantApiPostSettings,
            body: JSON.stringify({
                addressInformation: {
                    shippingAddress,
                    shipping_method_code: shippingMethod.method_code,
                    shipping_carrier_code: shippingMethod.carrier_code
                }
            }) 
        });

        // create order
        await fetch(`${merchantDomain}/rest/V1/guest-carts/${quoteId}/payment-information`, {
            ...merchantApiPostSettings,
            body: JSON.stringify({
                email: customer.email,
                paymentMethod: {
                    method: "zippayment"
                }
            }) 
        });
    }

    const placeOrder = async () => {
        const response = await fetch(`${apiDomain}/order`, {
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

    return (
        <div className={classes.root}>
            {
                customer && <Chip className={classes.avatar} avatar={<Avatar src="https://zip.co/assets/zip/core-icons/user.svg" />} label={`${customer.firstName} ${customer.lastName} (${customer.email})`} />
            }
            {
                item && 
                <Paper className={classes.paper}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm container>
                            <Grid item xs container direction="column" spacing={2}>
                            <Grid item xs>
                                <Typography gutterBottom variant="subtitle1">
                                { item.name }
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                SKU: {sku}
                                </Typography>
                            </Grid>
                            </Grid>
                            <Grid item>
                            <Typography variant="subtitle1">${item.price}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            }
            {
                addresses.length > 0 && 
                <Paper className={classes.paper}>
                    <Grid container spacing={2}>
                        <FormControl className={classes.formControl}>
                            <InputLabel id="billing-address">Billing Address</InputLabel>
                            <Select
                                labelId="billing-address"
                                value={addresses[0]}
                                onChange={(event) => setBillingAddress(addresses[event.target.value])}
                            >
                                {addresses.map(({addressLine1, regionCode}, index) => {
                                    return <MenuItem value={index}>{`${addressLine1} ${regionCode}`}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid container spacing={2}>
                        <FormControl className={classes.formControl}>
                            <InputLabel id="shipping-address">Shipping Address</InputLabel>
                            <Select
                                labelId="shipping-address"
                                value={addresses[0]}
                                onChange={(event) => { 
                                    setShippingAddress(addresses[event.target.value]);
                                    retrieveShippingMethods();
                                }}
                            >
                            {addresses.map(({addressLine1, regionCode}, index) => {
                                return <MenuItem value={index}>{`${addressLine1} ${regionCode}`}</MenuItem>
                            })}
                            </Select>
                        </FormControl>
                    </Grid>

                    {
                        shippingMethods.length > 0 &&
                        <Grid container spacing={2}>
                            <FormControl className={classes.formControl}>
                                <InputLabel id="shipping-methods">Shipping Methods</InputLabel>
                                <Select
                                    labelId="shipping-methods"
                                    value={shippingMethods[0]}
                                    onChange={(event) => setShippingMethod(event.target.value)}
                                >
                                {shippingMethods.map(({carrier_title, method_code}, index) => {
                                    return <MenuItem value={method_code}>{carrier_title}</MenuItem>
                                })}
                                </Select>
                            </FormControl>
                        </Grid>
                    }
                </Paper>
            }
            <button type="button" class="btn btn-primary" onClick={placeOrder}>Primary</button>
        </div>
    );
};

export default CheckoutPage;