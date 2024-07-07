if (document.readyState === 'complete' || document.readyState !== 'loading' && !document.documentElement.doScroll) {
    callback();
}
else {
    document.addEventListener('DOMContentLoaded', async() => {
        console.log('DOM content loaded');
        const scale = window.devicePixelRatio * 2;

        const loadImage = (url) => new Promise((resolve, reject) => {
            const img = new Image();
            img.addEventListener('load', () => resolve(img));
            img.addEventListener('error', (err) => reject(err));
            img.src = url;
        });

        function readFileAsText(file) {
            return new Promise((resolve,reject) => {
                let file_reader = new FileReader();
                file_reader.onload = () => resolve(file_reader.result);
                file_reader.onerror = () => reject(file_reader);
                file_reader.readAsText(file);
            });
        }

        const displaySize = 150;

        var upload_button = document.getElementById('upload_button');
        var upload_file_input = document.getElementById('upload_file_input');
        var preview_window = document.getElementById('preview_window');

        upload_button.addEventListener('click', ()=> {
            var clickEvent = new MouseEvent('click', { view: window, bubbles: false, cancelable: false });
            upload_file_input.dispatchEvent(clickEvent);
        }, false);

        upload_file_input.addEventListener('change', async (evt) => {
            var file = evt.currentTarget.files[0];
            if(!file) return;

            var file_name = file.name;
            document.getElementById('file_name').innerHTML=file_name;
            document.getElementById('file_type').innerHTML=file.type;

            var logo_file = await readFileAsText(file);
            preview_window.innerHTML = logo_file;

            var svg_blob = new Blob([logo_file], {type: 'image/svg+xml'});
            var DOMURL = window.URL || window.webkitURL || window;
            var b64str = DOMURL.createObjectURL(svg_blob);
            var _image = await loadImage(b64str);

            var image_h = _image.naturalHeight;
            var image_w = _image.naturalWidth;
            var scaleFactor = displaySize/Math.min(image_h,image_w);

            preview_window['style']['height'] = `${scaleFactor*image_h}px`;
            preview_window['style']['width'] = `${scaleFactor*image_w}px`;

            _image['style']['width'] = `${Math.round(image_w/scale)}px`;
            _image['style']['height'] = `${Math.round(image_h/scale)}px`;
            document.getElementById('file_dimensions').innerHTML=(`${image_w}px x ${image_h}px`);

            var _canvas = document.createElement('canvas');
            _canvas.width=image_w;
            _canvas.height=image_h;
            var _ctx = _canvas.getContext('2d');
            _canvas['style']['width'] = `${Math.round(image_w / scale)}px`;
            _canvas['style']['height'] = `${Math.round(image_h / scale)}px`;
            _canvas['style']['height'] = `${Math.round(image_h / scale)}px`;
            _canvas['style']['margin'] = '0';
            _canvas['style']['padding'] = '0';

            _ctx.scale(scale, scale);
            _ctx.drawImage(_image, 0, 0, Math.round(image_w/scale), Math.round(image_h/scale));

            var download_link = document.createElement('a');
            var name = document.querySelector('#download_name')

            name.addEventListener('input', (e) => {
                if (name.value != '') {
                    download_link.download = name.value + '.png';
                    download_link.href = _canvas.toDataURL();
                    download_link.innerText = name.value + '.png';
                    document.getElementById('download_link').innerHTML = download_link.outerHTML;
                }
                else {
                    download_link.download = 'default.png';
                    download_link.href = _canvas.toDataURL();
                    download_link.innerText = 'default.png';
                    document.getElementById('download_link').innerHTML = download_link.outerHTML;
                }
            });

            if (name.value != '') {
                download_link.download = name.value + '.png';
                download_link.href = _canvas.toDataURL();
                download_link.innerText = name.value + '.png';
                document.getElementById('download_link').innerHTML = download_link.outerHTML;
            }
            else {
                download_link.download = 'default.png';
                download_link.href = _canvas.toDataURL();
                download_link.innerText = 'default.png';
                document.getElementById('download_link').innerHTML = download_link.outerHTML;
            }
        }, false);
    });
}