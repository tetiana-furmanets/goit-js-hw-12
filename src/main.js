
import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');             // Форма пошуку
const input = form.elements['search-text'];             // Інпут з текстом пошуку
const loadMoreBtn = document.querySelector('.load-more'); // Кнопка "Load more"

const PER_PAGE = 15;      // Кількість картинок на сторінку
let currentPage = 1;       // Поточна сторінка
let currentQuery = '';     // Поточний запит користувача
let totalHits = 0;         // Загальна кількість результатів


hideLoadMoreButton(); 


form.addEventListener('submit', onSearch); // коли користувач натискає "Search"
if (loadMoreBtn) loadMoreBtn.addEventListener('click', onLoadMore); // кнопка "Load more"

async function onSearch(event) {
  event.preventDefault(); // відключаємо стандартну відправку форми

  const query = input.value.trim(); // беремо текст з інпуту без пробілів
  if (!query) {
    iziToast.warning({ title: 'Warning', message: 'Please enter a search query' });
    return;
  }


  currentQuery = query; 
  currentPage = 1;      
  totalHits = 0;       
  clearGallery();       
  hideLoadMoreButton(); 
  showLoader();         

  try {

    const data = await getImagesByQuery(currentQuery, currentPage);
    const { hits, totalHits: total } = data;
    totalHits = total;

    if (!hits || hits.length === 0) {
      iziToast.info({
        title: 'No results',
        message: 'Sorry, there are no images matching your search query. Please try again!',
      });
      return;
    }

 
    createGallery(hits);

    iziToast.success({
      title: 'Success',
      message: `Found ${totalHits} images.`,
    });

  
    if (currentPage * PER_PAGE < totalHits) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
      if (currentPage === 1) {
        iziToast.info({
          title: 'End',
          message: "We're sorry, but you've reached the end of search results.",
        });
      }
    }

  } catch (error) {
    console.error(error);
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong when fetching images. Please try again later.',
    });
  } finally {
    hideLoader(); // приховуємо лоадер в будь-якому випадку
  }
}


async function onLoadMore() {
  if (!currentQuery) return; // якщо ще не виконано пошук — нічого не робимо

  currentPage += 1; // збільшуємо номер сторінки
  showLoader();     // показуємо лоадер
  hideLoadMoreButton(); // ховаємо кнопку під час завантаження

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    const { hits } = data;

    if (!hits || hits.length === 0) {
      iziToast.info({
        title: 'End',
        message: "We're sorry, but you've reached the end of search results.",
      });
      hideLoadMoreButton();
      return;
    }

    createGallery(hits); // додаємо нові картинки

   
    const firstCard = document.querySelector('.gallery .gallery-item');
    if (firstCard) {
      const { height } = firstCard.getBoundingClientRect();
      window.scrollBy({
        top: height * 2,
        behavior: 'smooth',
      });
    }

  
    if (currentPage * PER_PAGE < totalHits) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
      iziToast.info({
        title: 'End',
        message: "We're sorry, but you've reached the end of search results.",
      });
    }

  } catch (error) {
    console.error(error);
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong while loading more images.',
    });
  } finally {
    hideLoader();
  }
}

