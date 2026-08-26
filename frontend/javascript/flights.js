
import { apiGet } from './api.js';

const searchForm = document.getElementById('flight-search-form');

const originInput = searchForm.querySelector('#origin-input');
const destinationInput = searchForm.querySelector('#destination-input');
const originHiddenInput = searchForm.querySelector('#origin-hidden-input');
const destinationHiddenInput = searchForm.querySelector('#destination-hidden-input');

const originOptions = searchForm.querySelector('#origin-options');
const destinationOptions = searchForm.querySelector('#destination-options');

originInput.addEventListener('input', async () => {
    originOptions.innerHTML = '<option value="Loading..."></option>';
    originOptions.innerHTML = await fetchSpaceports(originInput.value);
});

destinationInput.addEventListener('input', async () => {
    destinationOptions.innerHTML = '<option value="Loading..."></option>';
    destinationOptions.innerHTML = await fetchSpaceports(destinationInput.value);
});

originOptions.addEventListener('click', (event) => {
    const selectedOption = event.target;
    if (selectedOption.tagName === 'LI') {
        originInput.value = selectedOption.textContent;
        originHiddenInput.value = selectedOption.dataset.id;
        originOptions.innerHTML = '';
    } else {
        originOptions.innerHTML = '';
    }
});

destinationOptions.addEventListener('click', (event) => {
    const selectedOption = event.target;
    if (selectedOption.tagName === 'LI') {
        destinationInput.value = selectedOption.textContent;
        destinationHiddenInput.value = selectedOption.dataset.id;
        destinationOptions.innerHTML = '';
    } else {
        destinationOptions.innerHTML = '';
    }
});

async function fetchSpaceports(keyword) {
    try {
        const response = await apiGet(`/spaceports?keyword=${encodeURIComponent(keyword)}`);
        const spaceports = await response.json();

        console.log('Fetched spaceports:', spaceports);

        let optionsHtml = '';

        for (const spaceport of spaceports) {
            optionsHtml += `<li class="search-options-list-item" data-id="${spaceport.spaceportId}">${spaceport.spaceportName} (${spaceport.spaceportCode || ''})</li>`;
        }

        return optionsHtml;

    } catch (error) {
        console.error('Error loading spaceports:', error);
        return '';
    }
}
