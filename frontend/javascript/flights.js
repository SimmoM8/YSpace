import { apiGet } from './api.js';

const searchForm = document.getElementById('flight-search-form');

if (searchForm) {
    const originInput = searchForm.querySelector('#origin-input');
    const destinationInput = searchForm.querySelector('#destination-input');
    const originHiddenInput = searchForm.querySelector('#origin-hidden-input');
    const destinationHiddenInput = searchForm.querySelector('#destination-hidden-input');
    const dateInput = searchForm.querySelector('[name="departure-date"]');
    const originOptions = searchForm.querySelector('#origin-options');
    const destinationOptions = searchForm.querySelector('#destination-options');
    const isResultsPage = document.body.classList.contains('flights-page');
    let currentFlights = [];

    setupSpaceportSearch(originInput, originHiddenInput, originOptions);
    setupSpaceportSearch(destinationInput, destinationHiddenInput, destinationOptions);

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!validateSearch(originHiddenInput, destinationHiddenInput, dateInput)) return;

        const searchParams = createSearchParams(originInput, destinationInput, originHiddenInput, destinationHiddenInput, dateInput);

        if (!isResultsPage) {
            window.location.assign(`flights.html?${searchParams.toString()}`);
            return;
        }

        window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`);
        currentFlights = await searchFlights(searchParams);
    });

    if (isResultsPage) {
        const searchParams = new URLSearchParams(window.location.search);
        populateSearchForm(searchParams, { originInput, destinationInput, originHiddenInput, destinationHiddenInput, dateInput });

        if (hasCompleteSearch(searchParams)) currentFlights = await searchFlights(searchParams);

        const sortSelect = document.getElementById('flight-sort');
        sortSelect?.addEventListener('change', () => renderFlights(sortFlights(currentFlights, sortSelect.value)));
    }
}

function setupSpaceportSearch(textInput, hiddenInput, optionsList) {
    textInput.addEventListener('input', async () => {
        hiddenInput.value = '';
        textInput.setCustomValidity('');

        if (!textInput.value.trim()) {
            optionsList.replaceChildren();
            textInput.setAttribute('aria-expanded', 'false');
            return;
        }

        optionsList.innerHTML = '<li class="search-options-list-item">Loading...</li>';
        optionsList.innerHTML = await fetchSpaceports(textInput.value);
        textInput.setAttribute('aria-expanded', String(optionsList.children.length > 0));
    });

    optionsList.addEventListener('click', (event) => {
        const selectedOption = event.target.closest('[data-id]');

        if (selectedOption) {
            textInput.value = selectedOption.dataset.name;
            hiddenInput.value = selectedOption.dataset.id;
            textInput.setCustomValidity('');
        }

        optionsList.replaceChildren();
        textInput.setAttribute('aria-expanded', 'false');
    });
}

async function fetchSpaceports(keyword) {
    try {
        const response = await apiGet(`/spaceports?keyword=${encodeURIComponent(keyword)}`);
        const spaceports = await response.json();

        return spaceports.map((spaceport) => `
            <li class="search-options-list-item" data-id="${escapeHtml(spaceport.spaceportId)}"
                data-name="${escapeHtml(spaceport.spaceportName)}" role="option">
                ${escapeHtml(spaceport.spaceportName)} (${escapeHtml(spaceport.spaceportCode || '')})
            </li>
        `).join('');
    } catch (error) {
        console.error('Error loading spaceports:', error);
        return '<li class="search-options-list-item">Could not load spaceports.</li>';
    }
}

function validateSearch(originIdInput, destinationIdInput, dateInput) {
    originIdInput.previousElementSibling.setCustomValidity(originIdInput.value ? '' : 'Choose an origin from the suggestions.');
    destinationIdInput.previousElementSibling.setCustomValidity(destinationIdInput.value ? '' : 'Choose a destination from the suggestions.');
    dateInput.setCustomValidity(dateInput.value ? '' : 'Choose a departure date.');
    return searchForm.reportValidity();
}

function createSearchParams(originInput, destinationInput, originIdInput, destinationIdInput, dateInput) {
    return new URLSearchParams({
        originId: originIdInput.value,
        destinationId: destinationIdInput.value,
        date: dateInput.value,
        originName: originInput.value,
        destinationName: destinationInput.value
    });
}

function populateSearchForm(searchParams, inputs) {
    inputs.originHiddenInput.value = searchParams.get('originId') || '';
    inputs.destinationHiddenInput.value = searchParams.get('destinationId') || '';
    inputs.dateInput.value = searchParams.get('date') || inputs.dateInput.value;
    inputs.originInput.value = searchParams.get('originName') || inputs.originInput.value;
    inputs.destinationInput.value = searchParams.get('destinationName') || inputs.destinationInput.value;
}

function hasCompleteSearch(searchParams) {
    return ['originId', 'destinationId', 'date'].every((key) => searchParams.has(key));
}

async function searchFlights(searchParams) {
    const resultsList = document.querySelector('.flight-list');
    const submitButton = searchForm.querySelector('[type="submit"]');
    const apiParams = new URLSearchParams({
        originId: searchParams.get('originId'),
        destinationId: searchParams.get('destinationId'),
        date: searchParams.get('date')
    });

    submitButton.disabled = true;
    resultsList.innerHTML = '<p class="flights-results-message">Searching for flights...</p>';

    try {
        const response = await apiGet(`/flights/search?${apiParams.toString()}`);
        const flights = await response.json();
        updateResultsHeading(flights, searchParams.get('date'));
        renderFlights(sortFlights(flights, document.getElementById('flight-sort')?.value));
        return flights;
    } catch (error) {
        console.error('Error searching flights:', error);
        resultsList.innerHTML = `<p class="flights-results-message flights-results-error">${escapeHtml(error.message || 'Could not load flights.')}</p>`;
        updateResultsHeading([], searchParams.get('date'));
        return [];
    } finally {
        submitButton.disabled = false;
    }
}

function updateResultsHeading(flights, date) {
    const firstFlight = flights[0];
    document.querySelector('.flights-results-header h2').textContent = `${flights.length} departure${flights.length === 1 ? '' : 's'} found`;
    document.querySelector('.flights-results-kicker').textContent = firstFlight ? `${firstFlight.originCode} → ${firstFlight.destinationCode}` : 'No matching route';
    document.querySelector('.flights-results-date').textContent = formatDate(date);
}

function renderFlights(flights) {
    const resultsList = document.querySelector('.flight-list');

    if (!flights.length) {
        resultsList.innerHTML = '<p class="flights-results-message">No flights found for this route and date.</p>';
        return;
    }

    resultsList.innerHTML = flights.map(renderFlightCard).join('');
}

function renderFlightCard(flight) {
    const departure = new Date(flight.departureTime);
    const arrival = new Date(flight.arrivalTime);

    return `
        <article class="flight-card">
            <div class="flight-card-status">
                <span class="flight-number">${escapeHtml(flight.code)}</span>
            </div>
            <div class="flight-card-main">
                <div class="flight-time">
                    <span class="flight-time-value">${formatTime(departure)}</span>
                    <strong>${escapeHtml(flight.originCode)}</strong>
                    <span>${escapeHtml(flight.originName)}</span>
                </div>
                <div class="flight-journey">
                    <span class="flight-duration">${formatDuration(departure, arrival)}</span>
                    <div class="flight-route">
                        <span class="flight-route-point"></span><span class="flight-route-line"></span>
                        <span class="flight-craft-icon">✦</span>
                        <span class="flight-route-line"></span><span class="flight-route-point"></span>
                    </div>
                </div>
                <div class="flight-time flight-time-arrival">
                    <span class="flight-time-value">${formatTime(arrival)}</span>
                    <strong>${escapeHtml(flight.destinationCode)}</strong>
                    <span>${escapeHtml(flight.destinationName)}</span>
                </div>
                <div class="flight-price">
                    <span>From</span><strong>${formatPrice(flight.price)}</strong><small>per passenger</small>
                </div>
                <a href="#" class="button flight-select-button" data-flight-id="${escapeHtml(flight.id)}">
                    Select flight <span aria-hidden="true">→</span>
                </a>
            </div>
            <div class="flight-card-footer">
                <div class="flight-detail"><span>Spacecraft</span><strong>${escapeHtml(flight.spacecraft)}</strong></div>
                <div class="flight-detail"><span>Departure</span><strong>${formatDateTime(departure)}</strong></div>
                <div class="flight-detail"><span>Arrival</span><strong>${formatDateTime(arrival)}</strong></div>
            </div>
        </article>
    `;
}

function sortFlights(flights, sortBy) {
    const sortedFlights = [...flights];
    if (sortBy === 'departure') return sortedFlights.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    if (sortBy === 'price') return sortedFlights.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === 'duration') {
        return sortedFlights.sort((a, b) => (new Date(a.arrivalTime) - new Date(a.departureTime)) - (new Date(b.arrivalTime) - new Date(b.departureTime)));
    }
    return sortedFlights;
}

function formatTime(date) {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

function formatDuration(departure, arrival) {
    const totalMinutes = Math.max(0, Math.round((arrival - departure) / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    return [days && `${days}d`, hours && `${hours}h`, minutes && `${minutes}m`].filter(Boolean).join(' ') || '0m';
}

function formatPrice(price) {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(Number(price));
}

function escapeHtml(value) {
    return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
