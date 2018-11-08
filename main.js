var giffyModule = (function () {
    var gifContainer = document.getElementById('container');
    var pagination = document.getElementById('pagination');
    var search = document.getElementById('search');
    var searchPredicate;

    // Event listener for enter pressed for search
    search.addEventListener('keydown', function (e) {
        if (!e) {
            var e = window.event;
        }
        // Enter is pressed
        if (e.keyCode == 13) {
            giffyModule.search();
        }
    }, false);

    // Event listener for pagination
    pagination.addEventListener('click', function (e) {
        if (!e) {
            var e = window.event;
        }
        var page = e.target;

        if (page.getAttribute('class') !== 'pagination__item') return;
        // TODO find if there is a faster way
        Array.prototype.forEach.call(pagination.children, function (page) {
            page.classList.remove('pagination__item--active');
        });
        moveToPage(page.innerText);
        // mark target as an active page
        page.classList.add('pagination__item--active');
    });

    function displayGif(gif) {
        var gifElement = document.createElement('img');
        gifElement.setAttribute('src', gif.images.fixed_height.url);
        gifElement.setAttribute('alt', gif.id);
        gifElement.setAttribute('class', 'gif-container__item');
        gifContainer.appendChild(gifElement);
    }

    function clearGifContainer() {
        gifContainer.innerHTML = '';
    }

    function clearPagination() {
        pagination.innerHTML = '';
    }

    function createPagination(paginationParams) {
        var paginationCounter = 1;
        var totalCount;
        // max number of items to be displayed
        paginationParams.total_count > 500 ? totalCount = 500 : totalCount = paginationParams.total_count;

        for (var i = 0; i < totalCount; i += paginationParams.count) {
            var paginationItem = document.createElement('div');
            paginationItem.setAttribute('class', 'pagination__item');
            paginationItem.innerText = paginationCounter++;
            pagination.appendChild(paginationItem);
        }

        // setting first page active by default
        pagination.firstElementChild.classList.add('pagination__item--active');
    }

    function moveToPage(pageNumber) {
        clearGifContainer();
        var gifs = getGifs(pageNumber);
        gifs.data.forEach(function (gif) {
            displayGif(gif);
        });
    }

    function getGifs(pageNumber) {
        //default parameter ES5
        pageNumber = pageNumber || 1;
        var offset = (pageNumber - 1) * 5;

        // Creating a XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // Configuring it:
        xhr.open('GET', 'https://api.giphy.com/v1/gifs/search?q=' + searchPredicate +
            '&api_key=Iu24Y7bTGQ5IxxqLr11xt7tw4HTvxQNL&offset=' + offset +
            '&limit=5', false);

        // 3. Sending it
        xhr.send();

        // 4. if status is not 200, the result is an error
        if (xhr.status != 200) {
            // Process an error
            alert(xhr.status + ': ' + xhr.statusText); // output example: 404: Not Found
        } else {
            var result = JSON.parse(xhr.responseText);
            emulateLoading(2000);
            return result;
        }
    }

    function showLoader() {
        document.getElementById('container-wrap').style.height = '200px';
        gifContainer.style.visibility = 'hidden';
        document.getElementById('loader').style.visibility = 'visible';
    }

    function emulateLoading(time) {
        showLoader();
        setTimeout(function () {
            document.getElementById('container-wrap').style.height = 'auto';
            gifContainer.style.visibility = 'visible';
            document.getElementById('loader').style.visibility = 'hidden';
        }, time);
    }

    return {
        search: function () {
            clearGifContainer();
            clearPagination();
            searchPredicate = search.value;
            // TODO test case where gifs don't exist (due to GET method error)
            var gifs = getGifs();

            // if there is nothing to show
            if (gifs.data.length === 0) return;

            gifs.data.forEach(function (gif) {
                displayGif(gif);
            });
            createPagination(gifs.pagination);
            search.value = '';
        }
    }
})();