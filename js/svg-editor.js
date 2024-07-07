if (document.readyState === 'complete' || document.readyState !== 'loading' && !document.documentElement.doScroll) {
    callback();
}
else {
    document.addEventListener('DOMContentLoaded', async() => {
        console.log('DOM content loaded');
        
        var logo = document.querySelector('svg');
        var gradient = logo.children[0].children[0];
        var is_lin_grad = gradient.localName == 'linearGradient' ? true : false;
        var stops = gradient.children;
        var stop_down = document.querySelector('#dropdown_stop');
        var grad_down = document.querySelector('#dropdown_grad');
        var offset = document.querySelector('#offset');
        var stop_color = document.querySelector('#stop_color');
        var add_stop = document.querySelector('#add_stop');
        var remove_stop = document.querySelector('#remove_stop');
        var download_link = document.createElement('a');
        var name = document.querySelector('#download_name')

        if (is_lin_grad) {
            grad_down.selectedIndex = 1;
        }
        set_stops(stops);
        set_offset_color_html(stops);


        grad_down.addEventListener('change', (e) => {
            change_tag(grad_down.value);
        });
        stop_down.addEventListener('change', (e) => {
            stops = document.querySelector('svg').children[0].children[0].children;
            set_offset_color_html(stops);
        });
        offset.addEventListener('input', (e) => {
            set_offset_color_svg(true);
        });
        stop_color.addEventListener('input', (e) => {
            set_offset_color_svg(false);
        });
        add_stop.addEventListener('click', (e) => {
            this.add_stop();
        });
        remove_stop.addEventListener('click', (e) => {
            this.remove_stop();
        });
        name.addEventListener('input', (e) => {
            this.download(download_link, name);
        });
        this.download(download_link, name);
    });
}

function set_stops(stops) {
    var options = [];
    var option = document.createElement('option');
    var stop_down = document.querySelector('#dropdown_stop');

    while (stop_down.length != 0) {
        stop_down.firstChild.remove();
    }
    for (var i = 0; i < stops.length; i++) {
        option.text = 'Stop ' + (i + 1);
        option.value = i;
        options.push(option.outerHTML);
    }
    stop_down.insertAdjacentHTML('beforeEnd', options.join('\n'));

    set_offset_color_html(stops);
}

function set_offset_color_html(stops) {
    var current_stop = document.querySelector('#dropdown_stop').value;
    var offset = stops[current_stop].attributes[0].value;
    offset = offset.slice(0, offset.length - 1);
    var stop_color = stops[current_stop].attributes[1].value.slice(1);

    document.querySelector('#offset').value = offset;
    document.querySelector('#stop_color').value = stop_color;
}

function set_offset_color_svg(is_offset) {
    var logo = document.querySelector('svg');
    var gradient = logo.children[0].children[0];
    var stops = gradient.children;
    var current_stop = document.querySelector('#dropdown_stop').value;

    if (is_offset) {
        var offset = document.querySelector('#offset').value + '%';
        if (offset != '%' && stops[current_stop].attributes[0].value != offset) {
            stops[current_stop].attributes[0].value = offset;
        }
    }
    else {
        var stop_color = '#' + document.querySelector('#stop_color').value;
        if (stop_color != '#' && stops[current_stop].attributes[1].value != stop_color) {
            stops[current_stop].attributes[1].value = stop_color;
        }
    }
}

function change_tag(value) {
    var gradient = document.querySelector('svg').children[0].children[0];
    if (value == 'rad') {
        var clone = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        clone.id = 'grad';

        while (gradient.firstChild) {
            clone.appendChild(gradient.firstChild);
        }
        gradient.replaceWith(clone);
        set_stops(clone.children)
    }
    else {
        var clone = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        clone.id = 'grad';

        while (gradient.firstChild) {
            clone.appendChild(gradient.firstChild);
        }
        gradient.replaceWith(clone);
        set_stops(clone.children)
    }
}

function add_stop() {
    var gradient = document.querySelector('svg').children[0].children[0];
    var new_stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');

    new_stop.setAttribute('offset', '100%');
    new_stop.setAttribute('stop-color', '#FFFFFF');

    gradient.appendChild(new_stop);
    set_stops(gradient.children);
}

function remove_stop() {
    var stops = document.querySelector('svg').children[0].children[0].children;

    stops[stops.length - 1].remove();
    set_stops(stops);
}

function download(download_link, name) {
    if (name.value != '') {
        download_link.download = name.value + '.svg';
        download_link.href = get_svg_url();
        download_link.innerText = name.value + '.svg';
        document.getElementById('download_link').innerHTML = download_link.outerHTML;
    }
    else {
        download_link.download = 'default.svg';
        download_link.href = get_svg_url();
        download_link.innerText = 'default.svg';
        document.getElementById('download_link').innerHTML = download_link.outerHTML;
    }
}

function get_svg_url() {
    var svg = document.querySelector("svg");
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(svg);
    
    source = source.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink=');
    source = source.replace(/ns\d+:href/g, 'xlink:href');

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svg_blob = new Blob([preface, source], { type: "image/svg+xml;charset=utf-8" });
    return URL.createObjectURL(svg_blob);
}