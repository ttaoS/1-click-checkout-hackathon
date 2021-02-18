(function () {

    const domain = location.origin;
    const token = "qr9u7c8goinkrvxksv54vthimr8ezjz2";
    const checkoutUrl = "http://1-click-checkout.s3-website-ap-southeast-2.amazonaws.com";

    const widget = document.getElementById("zip-it-widget");
    let overlay = document.createElement('div');
    let quoteId = null;

    const retrieveCartItem = async (sku) => {
        const createCartResponse = await fetch(`${domain}/rest/V1/guest-carts`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        quoteId = await createCartResponse.json();
        const retrieveCartResponse = await fetch(`${domain}/rest/V1/guest-carts/${quoteId}`);
        const cart = await retrieveCartResponse.json();
        const cartId = cart.id;

        const addItemResponse = await fetch(`${domain}/rest/V1/guest-carts/${cartId}/items`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                cartItem: {
                  sku,
                  qty: 1,
                  quote_id: quoteId
                }
            }) 
        });

        return await addItemResponse.json();
    }

    const setBillingAddress = async (address)=> {
        const response = await fetch(`${domain}/rest/V1/guest-carts/${quoteId}/billing-address`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                address
            }) 
        });
        return await response.json();
    }

    const estimateShippingAddress = async (address)=> {
        const response = await fetch(`${domain}/rest/V1/guest-carts/${quoteId}/estimate-shipping-methods`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                address
            }) 
        });
        return await response.json();
    }


    const setShippingAddress = async (address, method_code, carrier_code)=> {
        const response = await fetch(`${domain}/rest/V1/guest-carts/${quoteId}/shipping-information`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                addressInformation: {
                    shippingAddress: address,
                    shipping_method_code: method_code,
                    shipping_carrier_code: carrier_code
                }
            }) 
        });
        return await response.json();
    }

    const createOrder = async (email) => {
        const createOrderResponse = await fetch(`${domain}/rest/V1/guest-carts/${quoteId}/payment-information`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                email,
                paymentMethod: {
                    method: "zippayment"
                }
            }) 
        });
        return createOrderResponse.json();
    }

    const openCheckoutModal = async (sku) => {
        overlay = document.createElement('div');
        const item = await retrieveCartItem(sku);
        const url = new URL(checkoutUrl);
        
        for(key in item) {
            url.searchParams.append(key, item[key]);
        }

        Object.assign(overlay.style, {
            position: 'absolute',
            left: '0',
            top: '0',
            display: 'table-cell',
            textAlign: 'center',
            overflow: 'hidden',
            verticalAlign: 'middle',
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: '2147483647',
            height: '100%',
            width: '100%'
        });

        const iframe = document.createElement('iframe');

        Object.assign(iframe.style, {
            width: '500px',
            minWidth: '500px',
            height: '700px',
            margin: '35px auto 0 auto',
            display: 'table-row',
            backgroundSize: '25%',
            textAlign: 'center',
            paddingTop: '50px',
            overflow: 'hidden',
            borderRadius: '10px',
            background: 'white'
        });

        var closeButton = document.createElement('img');
        closeButton.src = 'https://zip.co/assets/zip/core-icons/cross.svg';
        closeButton.onclick = () => closeModal();

        Object.assign(closeButton.style, {
            width: '20px',
            height: '20px',
            position: 'absolute',
            top: '45px',
            right: '20px',
            right: 'calc(50% - 240px)',
            cursor: 'pointer'
        });
        
        iframe.src = url.toString();
        overlay.appendChild(iframe);
        overlay.appendChild(closeButton);
        document.body.appendChild(overlay);
    }

    const closeModal = () => {
        document.body.removeChild(overlay);
    }

    const loadWidgetHtml = async () => {
        const response = await fetch("https://1-click-checkout.s3-ap-southeast-2.amazonaws.com/widget-js/widget.html");
        return response.text();
    }

    loadWidgetHtml().then(html => {
        const iframe = document.createElement('iframe');

        Object.assign(iframe.style, {
            border: 'none',
            padding: '0',
            overflow: 'hidden',
            height: '50px',
            width: '125px'
        });

        iframe.addEventListener('load', () => {
            iframe.contentDocument.documentElement.innerHTML = html;
            iframe.contentWindow.addEventListener('click', () => {
                const sku = document.querySelector('[itemprop="sku"]').innerText;
                openCheckoutModal(sku);
            });
        });
    
        widget.appendChild(iframe);
    });

    window.addEventListener('onmessage', ({ data }) => {
        switch(data.event) {
            case 'set_billing_address':
                const address = data.address;
                setBillingAddress(address);
                break;
            case 'estimate_shipping_address':
                const address = data.address;
                estimateShippingAddress(address);
                break;
            case 'set_shipping_address':
                const address = data.address;
                setShippingAddress(address);
                break;
            case 'place_order':
                const email = data.email;
                createOrder(email);
                closeModal();
                break;
            case 'cancel':
                closeModal();
                break;
        }
    });

})();