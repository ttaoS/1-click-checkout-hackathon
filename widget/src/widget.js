(function () {

    const domain = location.origin;
    const token = "qr9u7c8goinkrvxksv54vthimr8ezjz2";
    const checkoutUrl = "https://zip.co";

    const widget = document.getElementById("zip-it-widget");
    const overlay = ddocument.createElement('div');
    const quoteId = null;

    const retrieveCart = async (sku) => {
        const createCartResponse = await fetch(`${domain}/rest/V1/guest-carts`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                cartItem: {
                  sku,
                  qty: 1
                }
            }) 
        });
        quoteId = createCartResponse.json();
        const retrieveCartResponse = await fetch(`${domain}/rest/V1/guest-carts/${quoteId}/items`);
        return retrieveCartResponse.json();
    }

    const createOrder = async (chargeId) => {
        const createOrderResponse = await fetch(`${domain}/order`, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                chargeId,
                cartId
            }) 
        });
        return createOrderResponse.json();
    }

    const openCheckoutModal = async (sku) => {
        const cart = await retrieveCart(sku);
        const item = cart.items[0];
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
            borderRadius: '10px'
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
            right: 'calc(50% - 195px)',
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
                const sku = "24-MG04";
                openCheckoutModal(sku);
            });
        });
    
        widget.appendChild(iframe);
    });

    window.addEventListener('onmessage', ({ data }) => {
        switch(data.event) {
            case 'complete':
                createOrder();
                closeModal();
                break;
            case 'cancel':
                closeModal();
                break;
        }
    });

})();