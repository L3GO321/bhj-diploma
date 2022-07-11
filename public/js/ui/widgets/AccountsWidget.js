/**
 * Класс AccountsWidget управляет блоком
 * отображения счетов в боковой колонке
 * */

class AccountsWidget {
    /**
     * Устанавливает текущий элемент в свойство element
     * Регистрирует обработчики событий с помощью
     * AccountsWidget.registerEvents()
     * Вызывает AccountsWidget.update() для получения
     * списка счетов и последующего отображения
     * Если переданный элемент не существует,
     * необходимо выкинуть ошибку.
     * */
    constructor(element) {
        if (!element) {
            throw new Error('Передан пустой элемент!');
        }
        this.element = element;
        this.registerEvents();
        this.update();
    }

    /**
     * При нажатии на .create-account открывает окно
     * #modal-new-account для создания нового счёта
     * При нажатии на один из существующих счетов
     * (которые отображены в боковой колонке),
     * вызывает AccountsWidget.onSelectAccount()
     * */
    registerEvents() {
        const createAccountbtn = this.element.querySelector('.create-account');
        const billElements = this.element.querySelectorAll('.account');

        createAccountbtn.addEventListener('click', () => {
            App.getModal('createAccount').open();
        })

        for (let i = 0; i < billElements.length; i++) {
            billElements[i].addEventListener('click', () => {
                this.onSelectAccount(billElements[i]);
            })
        }
    }

    /**
     * Метод доступен только авторизованным пользователям
     * (User.current()).
     * Если пользователь авторизован, необходимо
     * получить список счетов через Account.list(). При
     * успешном ответе необходимо очистить список ранее
     * отображённых счетов через AccountsWidget.clear().
     * Отображает список полученных счетов с помощью
     * метода renderItem()
     * */
    update() {
        if (User.current()) {
            Account.list(User.current(), (err, response) => {
                if (response && response.success) {
                    this.clear();
                    response.data.map(bill => this.renderItem(bill));
                    this.registerEvents();
                } else {
                    console.log(err);
                }
            });
        }
    }

    /**
     * Очищает список ранее отображённых счетов.
     * Для этого необходимо удалять все элементы .account
     * в боковой колонке
     * */
    clear() {
        const accountsList = this.element.querySelectorAll('.account');

        for (let i = 0; i < accountsList.length; i++) {
            accountsList[i].remove();
        }
    }

    /**
     * Срабатывает в момент выбора счёта
     * Устанавливает текущему выбранному элементу счёта
     * класс .active. Удаляет ранее выбранному элементу
     * счёта класс .active.
     * Вызывает App.showPage( 'transactions', { account_id: id_счёта });
     * */
    onSelectAccount(element) {
        const prevActive = this.element.querySelector('.active');
        prevActive && prevActive.classList.remove('active');

        element.classList.add('active');

        App.showPage('transactions', { account_id: element.dataset.id });
    }

    /**
     * Возвращает HTML-код счёта для последующего
     * отображения в боковой колонке.
     * item - объект с данными о счёте
     * */
    getAccountHTML(item) {
        const billHTML = `<li class="account" data-id="${item.id}">
        <a href="#">
        <span>${item.name}</span>
        <span>${item.sum} ₽</span>
        </a>
    </li>`

        return billHTML;
    }

    /**
     * Получает массив с информацией о счетах.
     * Отображает полученный с помощью метода
     * AccountsWidget.getAccountHTML HTML-код элемента
     * и добавляет его внутрь элемента виджета
     * */
    renderItem(data) {
        const billHTML = this.getAccountHTML(data);
        this.element.insertAdjacentHTML('beforeend', billHTML);
    }
}
