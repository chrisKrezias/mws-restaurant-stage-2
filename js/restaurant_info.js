let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const section = document.getElementById("restaurant-info");

    const picture = document.createElement('picture');

    const source_small = document.createElement('source');
    // source_small.srcset = DBHelper.smallImageUrlForRestaurant(restaurant);
    source_small.setAttribute("data-srcset", DBHelper.smallImageUrlForRestaurant(restaurant));
    source_small.setAttribute("media", "(max-width: 674px)");
    picture.appendChild(source_small);

    const source_large = document.createElement('source');
    // source_large.srcset = DBHelper.imageUrlForRestaurant(restaurant);
    source_large.setAttribute("data-srcset", DBHelper.imageUrlForRestaurant(restaurant));    
    source_large.setAttribute("media", "(min-width: 675px)");
    picture.appendChild(source_large);

    const image = document.createElement('img');
    // image.src = DBHelper.smallImageUrlForRestaurant(restaurant);
    image.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    image.setAttribute("data-src", DBHelper.imageUrlForRestaurant(restaurant));
    image.setAttribute("alt", restaurant.name);
    image.id = "restaurant-info-img"
    image.classList.add("lazyload");
    picture.appendChild(image);

    section.appendChild(picture);

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const head = document.createElement('div');
    const name = document.createElement('span');
    name.innerHTML = review.name;
    name.classList.add("res-name");
    head.appendChild(name);

    const date = document.createElement('span');
    date.innerHTML = review.date;
    date.classList.add("res-date");
    head.appendChild(date);
    head.classList.add("res-head");
    head.setAttribute("tabindex", "0");

    li.appendChild(head);

    const rating = document.createElement('p');
    const rate_text = document.createElement('span');
    rate_text.innerHTML = `Rating: ${review.rating}`;
    rate_text.classList.add("res-rating");
    rating.appendChild(rate_text);
    rating.setAttribute("tabindex", "0");
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    comments.classList.add("res-comments");
    comments.setAttribute("tabindex", "0");
    li.appendChild(comments);

    li.setAttribute("tabindex", "0");
    li.setAttribute("aria-label", "Review");

    return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    li.setAttribute("aria-current", "page");
    li.setAttribute("tabindex", "0");
    breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}