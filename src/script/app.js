let countryHolder, amountHolder, notificationHolder, sideBarHolder;
const localKey = 'travel-planner';

const closeNav = () => {
    sideBarHolder.classList.remove('c-sidebar--mobile');    
}

const openNav = () => {
    sideBarHolder.classList.add('c-sidebar--mobile');      
}

const hasItem = key => {
    // de tilde zet het om in een bit, true of false
    return ~getAllItems().indexOf(key); // -1 -> not found, anders de positie
}; // true false

const addItem = key => {
    let countries = getAllItems();
    countries.push(key);
    localStorage.setItem(localKey, JSON.stringify(countries));
}; // void / (true || false)?

const removeItem = key => {
    let countries = getAllItems();
    countries.splice(countries.indexOf(key),1);
    localStorage.setItem(localKey, JSON.stringify(countries));
}; // void / (true || false)?

const removeAllItems = () => {
    localStorage.removeItem(localKey);
    updateCounter();
    let countries = document.querySelectorAll('.c-country-input');
    for (const country of countries) {
        country.checked = false;
    }
}

const getAllItems = () => {
    return JSON.parse(localStorage.getItem(localKey)) || [];
}; // 

const countItems = () => {
    return getAllItems().length;
}; // integer

const updateCounter = () => {
    amountHolder.innerHTML = countItems();
};

const fadeAndRemoveNotification = (notification) => {
    notification.classList.add('u-fade-out');
    notification.addEventListener('transitionend', function(){
        notificationHolder.removeChild(notification);
    })

    // Of //

    // setTimeout(() => {
    //     notificationHolder.remove(notification);
    // },800);
};

const showNotification = (element) => {    
    // 1 Show in js-notification-holder
    let notification = document.createElement('div');
    notification.classList.add('c-notification');
    notification.innerHTML = `
        <h2 class="c-notification__header">
            You have selected ${element.dataset.countryName}.
        </h2>
        <button class="c-notification__action">
            Undo
        </button>`;
    notificationHolder.append(notification);
    // 2 fade out after 800ms
    setTimeout(() => {
        fadeAndRemoveNotification(notification);
    },1500);
};

const addListenersToCountries = function (classSelector) {
    const countries = document.querySelectorAll(classSelector);
    for (const country of countries) {
        country.addEventListener('click', function () {
            const countryKey = this.getAttribute('for'); // for heeft de correcte en unieke key
            if (hasItem(countryKey)) {
                removeItem(countryKey);
            } else {
                addItem(countryKey);
                showNotification(country);
            }
            updateCounter();
        })
    }
};

const showCountries = data => {
    // #1 Loop the data
    let countries = ''
    for (const country of data) {
        // #2 Build an HTML-string for each country
        countries += `
            <article>
                <input id="${country.cioc}-${country.alpha2Code}" class="o-hide c-country-input" type="checkbox" ${hasItem(country.cioc + '-' + country.alpha2Code) ? 'checked="checked"' : ''} />
                <label for="${country.cioc}-${country.alpha2Code}" class="c-country js-country" data-country-name="${country.name}">
                    <div class="c-country-header">
                        <h2 class="c-country-header__name">${country.name}</h2>
                        <img class="c-country-header__flag" src="${country.flag}" alt="The flag of ${country.name}.">
                    </div>
                    <p class="c-country__native-name">${country.nativeName}</p>
                </label>
            </article>`;
    }
    countryHolder.innerHTML = countries;

    addListenersToCountries('.js-country');
};

const fetchCountries = region => {
    fetch(`https://restcountries.eu/rest/v2/region/${region}`)
        .then(r => r.json())
        .then(data => showCountries(data))
        .catch(err => console.error(`An error occured 😭, ${err}`));
};

const enableListeners = () => {
    // #1 Get some buttons
    const regionButtons = document.querySelectorAll(".js-region-select");
    // #2 Listen to the clicks
    for (const button of regionButtons) {
        button.addEventListener('click', function () {
            // #2.1 Look up the data property
            const region = this.getAttribute('data-region');

            // #2.2 Get data from the API
            fetchCountries(region);
        })
    }

    countryHolder = document.querySelector('.js-country-holder');
    amountHolder = document.querySelector('.js-amount');
    notificationHolder = document.querySelector('.js-notification-holder');
    sideBarHolder = document.querySelector('.c-sidebar');

    let mobile_nav_open = document.querySelector('.js-open-nav');
    mobile_nav_open.addEventListener('click', function(){
        openNav();
    })

    let mobile_nav_close = document.querySelector('.js-close-nav');
    mobile_nav_close.addEventListener('click', function(){
        closeNav();
    })

    let reset_button = document.querySelector('.js-reset');
    reset_button.addEventListener('click', function(){
        removeAllItems();        
    })

    // Always start with Europe. 
    fetchCountries('europe');
    updateCounter();
};

const init = () => {
    enableListeners();
};

document.addEventListener('DOMContentLoaded', init);