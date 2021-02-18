(function () {
    const checkoutUrl = "http://1-click-checkout.s3-website-ap-southeast-2.amazonaws.com";

    const widget = document.getElementById("zip-it-widget");
    let overlay = document.createElement('div');

    const openCheckoutModal = async (sku) => {
        overlay = document.createElement('div');
        const url = new URL(checkoutUrl);
        url.searchParams.append('sku', sku);

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
})();

window.addEventListener('onmessage', ({ data }) => {
    console.log('event', data);
    switch(data.event) {
        case 'complete':
            const orderId = data.order_id;
            closeModal();
            location.assign(`checkout/onepage/success/?order_id=${orderId}`);
            break;
        case 'cancel':
            closeModal();
            break;
    }
});