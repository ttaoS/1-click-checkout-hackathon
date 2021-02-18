const zipitwidget = document.getElementById("zip-id-widget");
const zipitIframe = document.createElement('iframe');

fetch("https://1-click-checkout.s3-ap-southeast-2.amazonaws.com/widget-js/widget.html").then(function (response) {
	return response.text();
}).then(function (html) {
    zipitIframe.style = "border: none; padding: 0; overflow: hidden; height: 50px; width: 125px;";

    zipitIframe.addEventListener('load', () => {
        zipitIframe.contentDocument.documentElement.innerHTML = html;
        zipitIframe.contentWindow.addEventListener('click', event => {
            console.log('get production info');
        });
    });

    zipitwidget.appendChild(zipitIframe);

}).catch(function (err) {
	console.warn('Something went wrong.', err);
});