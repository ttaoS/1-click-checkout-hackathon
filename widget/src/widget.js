(function () {
    const checkoutUrl = "http://1-click-checkout.s3-website-ap-southeast-2.amazonaws.com";

    const widget = document.getElementById("zip-it-widget");
    let overlay = document.createElement('div');

    const getProductAttributes = () => {
        const params = Object.fromEntries(new FormData(document.querySelector("form#product_addtocart_form")));

        const attributes = Object.entries(params).reduce((newObj, [key, val]) => {
            if (key.includes('super_attribute')) { // how to check "exist" is true ?
              const id = key.match(/(\d)+/gm)[0];

              if (!newObj['attributes']) {
                newObj['attributes'] = [];
              }

              newObj['attributes'].push({
                  id,
                  value: val
              })
            }

            if (key == 'qty') {
                newObj['qty'] = val;
            }

            return newObj;
          }, {});

          const sku = document.querySelector('[itemprop="sku"]').innerText;
          attributes['sku'] = sku;

          return attributes;
    }

    const openCheckoutModal = async () => {
        overlay = document.createElement('div');
        const url = new URL(checkoutUrl);
        const attributes = getProductAttributes();
        url.searchParams.append('product', JSON.stringify(attributes));

        Object.assign(overlay.style, {
            position: 'fixed',
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
            height: '750px',
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
                openCheckoutModal();
            });
        });
    
        widget.appendChild(iframe);
    });

    window.addEventListener('message', ({ data: { name, event, orderId } }) => {

        if (name === 'zip_it') {
            console.log('event', name, orderId);
            switch(event) {
                case 'complete':
                    closeModal();
                    location.assign(`checkout/onepage/success/?order_id=${orderId}`);
                    break;
            }
        }
        
    });
})();