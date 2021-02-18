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
    }
  }));

const CheckoutPage = ({ sku, merchantDomain }) => {
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

    const token = "ff80ksbgubze87e04a9qlxz9xp42qyhk";
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

    useEffect(() => {
        retrieveCartItem();
        retrieveAddresses();
        retrieveCustomerDetails();
    }, []);

    const retrieveCartItem = async () => {
        const createCartResponse = await fetch(`${merchantDomain}/rest/V1/guest-carts`, postSettings);
        const quoteId = await createCartResponse.json();

        const retrieveCartResponse = await fetch(`${merchantDomain}/rest/V1/guest-carts/${quoteId}`);
        const cart = await retrieveCartResponse.json();
        const cartId = cart.id;

        const addItemResponse = await fetch(`${merchantDomain}/rest/V1/guest-carts/${cartId}/items`, {
            ...postSettings,
            body: JSON.stringify({
                cartItem: {
                sku,
                qty: 1,
                quote_id: quoteId
                }
            }) 
        });

        const product = await addItemResponse.json();
        setProduct(product);
        setQuoteId(quoteId);
        setTotal(product.price);
    }

    const retrieveAddresses = async () => {
        const addressesResponse = await fetch(`${apiDomain}/shipping?customerId=${customerId}`);
        const { shippingAddresses: addresses } = await addressesResponse.json();
        setAddresses(addresses);
    }

    const retrieveCustomerDetails = async () => {
        const customerResponse = await fetch(`${apiDomain}/customer?customerId=${customerId}`);
        const customer = await customerResponse.json();
        setCustomer(customer);
    }

    const retrieveShippingMethods = async (addressKey)=> {
        const { region, regionCode, regionId, countryId, addressLine1, postalCode, city } = addresses[addressKey];
        const { phoneNumber, firstName, lastName } = customer;
        const shippingMethodsResponse = await fetch(`${merchantDomain}/rest/V1/guest-carts/${quoteId}/estimate-shipping-methods`, {
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

    const placeOrder = async () => {
        setLoading(true);

        await saveBillingAddress();
        await saveShippingAddress();

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

        // place order
        const { region, addressLine1, postalCode, city } = addresses[shippingAddressKey];
        const response = await fetch(`${apiDomain}/order`, {
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

        const { ChargeId } = await response.json();

        const isInIFrame = window.self !== window.top;
        // success
        if (isInIFrame && ChargeId) {
            console.log('send message');
            window.parent.postMessage(
                {
                    name: 'zip_it',
                    event: 'complete',
                    orderId: orderId,
                    chargeId: ChargeId,
                },
                '*',
            );
        }

        setLoading(false);
        setSuccess(true);

        setTimeout(() => {
            window.location.replace(`${merchantDomain}/checkout/onepage/success/?order_id=${orderId}`);
        }, 500)
    }

    if (success) {
        return <>
                <div className={classes.welcomeSplashContainer}>
                <div className={classes.checkoutLoading}>
                    <Spinner />
                </div>
                <h1 className={classes.checkoutLoading}>Thanks for choosing Zip</h1>
                <div className={classes.checkoutLoading}>We&apos;ll redirect you to the merchant site</div>
            </div>
        </>
    }

    if (!quoteId) {
        return <>
                <div className={classes.welcomeSplashContainer}>
                <div className={classes.checkoutLoading}>
                    <Icons.ZipLogo size="50" />
                </div>
                <h1 className={classes.checkoutLoading}>Order been placed successfully</h1>
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
                  <Lists.Basic style={{ display: 'inline-table' }} items={[
                    product && {
                            primary: `${product.name} $${product.price}`,
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
                            setTotal(product.price + shippingAmount);
                        }} options={
                            shippingMethods.map(({carrier_title}, index) => {
                                return {
                                    value: index,
                                    label: carrier_title
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