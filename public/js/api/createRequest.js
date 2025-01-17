/**
 * Основная функция для совершения запросов
 * на сервер.
 * */
const createRequest = (options = {}) => {
    const request = new XMLHttpRequest();
    request.responseType = 'json';

    if (options.method === 'GET') {
        let url = new URL(location.origin + options.url);

        for (key in options.data) {
            url.searchParams.set(key, options.data[key]);
        }

        request.open('GET', url);
        request.send();
    } else {
        const formData = new FormData();

        for (let key in options.data) {
            formData.append(key, options.data[key]);
        }

        request.open(options.method, options.url);
        request.send(formData);
    }

    request.onload = () => {
        const response = request.response;
        if (response.success) {
            options.callback(null, response);
        } else {
            options.callback(response.error);
        }
    }

    request.onerror = () => {
        options.callback(request.statusText);
    }

};
