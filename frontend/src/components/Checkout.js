import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Spinner } from '@zip/components';
import { AppBar } from '@zip/components';
import { Buttons } from '@zip/components';
import { Lists, Icons } from '@zip/components';
import { TextFields } from '@zip/components';

const useStyles = makeStyles((theme) => ({
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
    formControl: {
        margin: theme.spacing(1),
        minWidth: '100%',
    },
    welcomeSplashContainer: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        height: '500px',
        justifyContent: 'center'
    },
    checkoutLoading: {
        margin: '5px',
        textAlign: 'center',
        width: '400px',
        fontSize: '24px'
    },
    productList: {
        display: 'content'
    }
  }));

const CheckoutPage = ({ sku, merchantDomain, qty, attributes }) => {
    const [quoteId, setQuoteId] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(null);
    const [success, setSuccess] = useState(false);

    const [addresses, setAddresses] = useState([]);
    const [shippingMethods, setShippingMethods] =  useState([]);
    const [billingAddressKey, setBillingAddressKey] = useState(null);
    const [shippingAddressKey, setShippingAddressKey] = useState(null);
    const [shippingMethodKey, setShippingMethodKey] =  useState(null);
    const [customer, setCustomer] = useState(null);
    const classes = useStyles();

    const token = "qr9u7c8goinkrvxksv54vthimr8ezjz2";
    const customerId = "5201314";
    const apiDomain = "https://zip-api-shipping.labs.au.edge.zip.co";
    const postSettings = {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    };

    useEffect( () => {
        Promise.all([retrieveCartItem(), retrieveAddresses(), retrieveCustomerDetails()])
            .then(async values => {
                let addressObj =   values[1];
                let customer =  values[2];
                let quoteId =  values[0];
            await retrieveShippingMethods(addressObj.defaultAddressKey, addressObj.addresses, customer, quoteId);
        })
    }, []);

    const retrieveCartItem = async () => {
        const createCartResponse = await fetch(`${merchantDomain}/rest/V1/guest-carts`, postSettings);
        const quoteId = await createCartResponse.json();

        const retrieveCartResponse = await fetch(`${merchantDomain}/rest/V1/guest-carts/${quoteId}`);
        const cart = await retrieveCartResponse.json();
        const cartId = cart.id;

        const cartItem = {
            sku,
            qty: 1,
            quote_id: quoteId
        };

        if (attributes) {
            cartItem['product_option'] = {
                extension_attributes: {
                  configurable_item_options: attributes.map(({id, value}) => {
                    return {
                        option_id: id, 
                        option_value: value
                     };
                  })
                }
             };
        }
        const addItemResponse = await fetch(`${merchantDomain}/rest/V1/guest-carts/${cartId}/items`, {
            ...postSettings,
            body: JSON.stringify({
                cartItem
            }) 
        });

        const product = await addItemResponse.json();
        setProduct(product);
        setQuoteId(quoteId);
        setTotal(product.price * product.qty);
        return quoteId;
    }

    const retrieveAddresses = async () => {
        const addressesResponse = await fetch(`${apiDomain}/shipping?customerId=${customerId}`);
        const { shippingAddresses: addresses } = await addressesResponse.json();
        if(addresses && addresses.length > 0){
            setAddresses(addresses);
            const defaultAddressKey = addresses.findIndex(ad => ad.isPrefer === true) || 0;
            setShippingAddressKey(defaultAddressKey);
            setBillingAddressKey(defaultAddressKey);
            return {
                defaultAddressKey: defaultAddressKey,
                addresses: addresses
            }; 
        }
        setAddresses([]);
        return undefined;
    }

    const retrieveCustomerDetails = async () => {
        const customerResponse = await fetch(`${apiDomain}/customer?customerId=${customerId}`);
        const customer = await customerResponse.json();
        setCustomer(customer);
        return customer;
    }

    const retrieveShippingMethods = async (addressKey, passAddresses, passCustomer, passQuoteId)=> {
        const targetAddresses = passAddresses || addresses;
        const targetCustomer = passCustomer || customer;
        const targetQuoteId = passQuoteId || quoteId;
        const { region, regionCode, regionId, countryId, addressLine1, postalCode, city } = targetAddresses[addressKey];
        const { phoneNumber, firstName, lastName } = targetCustomer;
        const shippingMethodsResponse = await fetch(`${merchantDomain}/rest/V1/guest-carts/${targetQuoteId}/estimate-shipping-methods`, {
            ...postSettings,
            body: JSON.stringify({
                address: {
                    region,
                    region_code: regionCode,
                    region_id: regionId,
                    country_id: countryId,
                    street: [
                        addressLine1
                    ],
                    postcode: postalCode,
                    city,
                    telephone: phoneNumber,
                    firstname: firstName,
                    lastname: lastName
                }
            }) 
        });
        const shippingMethods = await shippingMethodsResponse.json();
        setShippingMethods(shippingMethods);
    }

    const saveBillingAddress = async() => {
        const { region, regionCode, regionId, countryId, addressLine1, postalCode, city } = addresses[billingAddressKey];
        const { phoneNumber, firstName, lastName, email } = customer;

        // save billing address
        await fetch(`${merchantDomain}/rest/V1/guest-carts/${quoteId}/billing-address`, {
            ...postSettings,
            body: JSON.stringify({
                address: {
                    region,
                    region_code: regionCode,
                    region_id: regionId,
                    country_id: countryId,
                    street: [
                        addressLine1
                    ],
                    postcode: postalCode,
                    city,
                    telephone: phoneNumber,
                    firstname: firstName,
                    lastname: lastName,
                    email
                }
            }) 
        });
    }

    const saveShippingAddress = async() => {
        const { region, regionCode, regionId, countryId, addressLine1, postalCode, city } = addresses[shippingAddressKey];
        const { phoneNumber, firstName, lastName } = customer;
        const { method_code, carrier_code } = shippingMethods[shippingMethodKey];

        // save billing address
        await fetch(`${merchantDomain}/rest/V1/guest-carts/${quoteId}/shipping-information`, {
            ...postSettings,
            body: JSON.stringify({
                addressInformation: {
                    shippingAddress: {
                        region,
                        region_code: regionCode,
                        region_id: regionId,
                        country_id: countryId,
                        street: [
                            addressLine1
                        ],
                        postcode: postalCode,
                        city,
                        telephone: phoneNumber,
                        firstname: firstName,
                        lastname: lastName
                    },
                    shipping_method_code: method_code,
                    shipping_carrier_code: carrier_code
                }
            }) 
        });
    }

    const createOrder = async () => {
        // create order
        const orderReponse = await fetch(`${merchantDomain}/rest/V1/guest-carts/${quoteId}/payment-information`, {
            ...postSettings,
            body: JSON.stringify({
                email: customer.email,
                paymentMethod: {
                    method: "zippayment"
                }
            }) 
        });
        const orderId = await orderReponse.json();
        return orderId;
    }

    const wait = (ms, value = {}) => new Promise((resolve) => setTimeout(resolve, ms, value));

    const placeOrder = async () => {
        setLoading(true);

        await saveBillingAddress();
        await saveShippingAddress();

        const orderId = await createOrder();

        // place order
        const { region, addressLine1, postalCode, city } = addresses[shippingAddressKey];
        await fetch(`${apiDomain}/order`, {
            ...postSettings,
            body: JSON.stringify({
                Amount: total,
                OrderId: orderId,
                CheckoutId: "co_112312312",
                MerchantId: "m_123131321",
                CustomerId: customerId,
                OrderItems: [{
                    Name : product.name,
                    Amount : product.price
                }],
                ShippingAddress: {
                    AddressLine1: addressLine1,
                    PostalCode: postalCode,
                    State: region,
                    Suburb: city
                }
            })
        });

        setLoading(false);
        setSuccess(true);

        await wait(2000);

        const isInIFrame = window.self !== window.top;
        // success
        if (isInIFrame) {
            console.log('send message', orderId);
            window.parent.postMessage(
                {
                    name: 'zip_it',
                    event: 'complete',
                    orderId: orderId
                },
                '*',
            );
        } else {
            window.location.replace(`${merchantDomain}/checkout/onepage/success/?order_id=${orderId}`);
        }
    }

    if (success) {
        return <>
                <div className={classes.welcomeSplashContainer}>
                <div className={classes.checkoutLoading}>
                    <Icons.ZipLogo size="50" />
                </div>
                <h1 className={classes.checkoutLoading}>Order been placed successfully</h1>
                <div className={classes.checkoutLoading}>We&apos;ll redirect you to the merchant site</div>
            </div>
        </>
    }

    if (!quoteId) {
        return <>
                <div className={classes.welcomeSplashContainer}>
                <div className={classes.checkoutLoading}>
                    <Spinner />
                </div>
                <h1 className={classes.checkoutLoading}>Thanks for choosing Zip</h1>
                <div className={classes.checkoutLoading}>We&apos;ll make this quick and easy</div>
            </div>
        </>
    }

    return (
        <>
            <AppBar endAdornment={<div style={{
                textAlign: 'right'
                }}>{ product && `$${total}` }</div>}/>

            {
                product && 
                  <Lists.Basic className={classes.productList} items={[
                    product && {
                            primary: `${product.name} $${product.price} X ${qty}`,
                            secondary: `SKU #: ${sku}`,
                            icon: Icons.Cart
                    },
                    customer && {
                        primary: `${customer.firstName} ${customer.lastName}`,
                        secondary: `Email: ${customer.email}`,
                        icon: Icons.EmptyProfile
                      }
                ]} />
            }


            {
                addresses.length > 0 && 
                <>
                    <TextFields.Select label="Billing Address" onChange={event => setBillingAddressKey(event.target.value)} options={
                        addresses.map(({addressLine1, regionCode}, index) => {
                            return {
                                value: index,
                                label: `${addressLine1} ${regionCode}`
                            };
                        })
                    } value={billingAddressKey} />

                    <TextFields.Select label="Shipping Address" onChange={event => { 
                        setShippingAddressKey(event.target.value);
                        retrieveShippingMethods(event.target.value);
                    }} options={
                        addresses.map(({addressLine1, regionCode}, index) => {
                            return {
                                value: index,
                                label: `${addressLine1} ${regionCode}`
                            };
                        })
                    } value={shippingAddressKey} />

                    {
                        shippingMethods.length > 0 && <TextFields.Select label="Shipping Method" onChange={event => {
                            setShippingMethodKey(event.target.value);
                            const shippingAmount = shippingMethods[event.target.value].amount;
                            setTotal(product.price * product.qty + shippingAmount);
                        }} options={
                            shippingMethods.map(({carrier_title, amount}, index) => {
                                return {
                                    value: index,
                                    label: `${carrier_title} $${amount}`
                                };
                            })
                        } value={shippingMethodKey} />
                    }
                </>
            }

            
             <Buttons.Primary onClick={placeOrder} loading={loading}>
                Place Order
              </Buttons.Primary>
        </>
    );
};

export default CheckoutPage;