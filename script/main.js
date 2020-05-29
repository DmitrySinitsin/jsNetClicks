const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowsList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const API_KEY = '53150ea7985943e4f2df5de6654cab0c';
const tvShows = document.querySelector('.tv-shows');
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const SERVER = 'https://api.themoviedb.org/3';
const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');

const div = document.getElementsByTagName('div');
// console.log(div);

//прелоадер(вертушка)
const loading = document.createElement('div');
loading.className = 'loading';
// console.log(loading);

//берем данные по кино с сайта через API
const DBService = class {
    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Не удалось получить данные
            по адресу ${url} ошибка ${res.status}`);
        }
    }

    getTestData = () => {
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }

    getSearchResult = query => {
        return this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU&page=1`);
    }

    getTvShow = id => this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
}

// console.log(new DBService().getSearchResult('папа'));

const renderCard = (response) => {
    // console.log(response);
    tvShowsList.textContent = '';

    response.results.forEach((
        {
            backdrop_path: backdrop,
            name: title,
            poster_path: poster,
            vote_average: vote,
            id
        }
    ) => {

        const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropIMG = backdrop ? IMG_URL + backdrop : '';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';//бейдж со средним индексом голосовани сверху слева красный

        const card = document.createElement('li');
        // card.idTV = id;//получение идентификатора сериала из респонза
        // console.dir(card);
        card.classList.add('tv-shows__item');
        card.innerHTML = `
        <a href="#" id="${id}" class="tv-card">
                            ${voteElem}
                            <img class="tv-card__img"
                                src="${posterIMG}"
                                data-backdrop="${backdropIMG}"
                                alt="${title}">
                            <h4 class="tv-card__head">${title}</h4>
                        </a>
        `;
        loading.remove();//удаление после вывода верстки
        tvShowsList.append(card);
    });

};





// обработка запроса поиска вверху форма
searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();//получение ввода в поле запроса пользователем c обрезанием пробелов, на случай пустого ввода
    searchFormInput.value = '';//чистим после запроса
    if (value) {
        tvShows.append(loading);//вывод прелоадера(вертушка) во время загрузки страницы для слабого интернета
        new DBService().getSearchResult(value).then(renderCard);
    }
});


//открытие и закрытие меню слева
hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.left-menu')) {//если клик за пределами меню
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
    }
});

leftMenu.addEventListener('click', (event) => {
    event.preventDefault();//чтобы при клике по менюхам слева не возвращало страницу наверх
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
});

//открытие модального окна
tvShowsList.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const card = target.closest('.tv-card');
    if (card) {
        // console.dir(card);
        new DBService()//заполнение модального окна
            .getTvShow(card.id)
            .then(({ poster_path: posterPath,
                name: title,
                genres,
                vote_average: voteAverage,
                homepage,
                overview }) => {

                tvCardImg.src = IMG_URL + posterPath;
                tvCardImg.alt = title;
                modalTitle.textContent = title;
                // genresList.innerHTML = data.genres.reduce((acc, item) => `${acc} <li>${item.name}</li>`, '');
                genresList.textContent = '';
                // for (const item of data.genres) {
                //     genresList.innerHTML += `<li>${item.name}</li>`;
                // }
                genres.forEach(item => {
                    genresList.innerHTML += `<li>${item.name}</li>`;
                })
                rating.textContent = voteAverage;
                description.textContent = overview;
                modalLink.href = homepage;
            })
            .then(() => {
                document.body.style.overflow = 'hidden';//скролл убран
                modal.classList.remove('hide');
            })

    }
});

//закрытие модалки
modal.addEventListener('click', event => {
    if (event.target.closest('.cross') || //клик по кресту
        event.target.classList.contains('modal')) {//клик мимо модалки
        document.body.style.overflow = '';//возврат на дефолтные из разметки настройки
        modal.classList.add('hide');
    }
});

//смена карточки
const changeImage = event => {
    const card = event.target.closest('.tv-shows__item');
    if (card) {
        const img = card.querySelector('.tv-card__img');
        const changeImg = img.dataset.backdrop;
        // if (changeImg) {
        //     img.dataset.backdrop = img.src;
        //     img.src = changeImg;
        // }
        if (img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
        }
    }
};
tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);