/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
    /**
     * Если переданный элемент не существует,
     * необходимо выкинуть ошибку.
     * Сохраняет переданный элемент и регистрирует события
     * через registerEvents()
     * */
    constructor(element) {
        if (!element) {
            throw new Error('Передан пустой элемент!');
        }

        this.element = element;
        this.registerEvents();
    }

    /**
     * Вызывает метод render для отрисовки страницы
     * */
    update() {
        this.render(this.lastOptions);
    }

    /**
     * Отслеживает нажатие на кнопку удаления транзакции
     * и удаления самого счёта. Внутри обработчика пользуйтесь
     * методами TransactionsPage.removeTransaction и
     * TransactionsPage.removeAccount соответственно
     * */
    registerEvents() {
        const removeAccountbtn = this.element.querySelector('.remove-account');
        const transactionBlock = this.element.querySelector('.content');

        removeAccountbtn.addEventListener('click', () => {
            const isRemove = confirm('Вы действительно хотите удалить счёт?');
            if (isRemove) {
                this.removeAccount();
            }
        });

        transactionBlock.addEventListener('click', (e) => {
            const parent = e.target.closest('.transaction__remove');

            if (parent) {
                const isRemove = confirm('Вы действительно хотите удалить эту транзакцию?');
                if (isRemove) {
                    this.removeTransaction(parent.dataset.id);
                }
            }
        })
    }

    /**
     * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
     * Если пользователь согласен удалить счёт, вызовите
     * Account.remove, а также TransactionsPage.clear с
     * пустыми данными для того, чтобы очистить страницу.
     * По успешному удалению необходимо вызвать метод App.updateWidgets() и App.updateForms(),
     * либо обновляйте только виджет со счетами и формы создания дохода и расхода
     * для обновления приложения
     * */
    removeAccount() {
        if (!this.lastOptions) return;

        Account.remove({ id: this.lastOptions.account_id }, (err, response) => {
            this.clear();
            App.updateWidgets();
            App.updateForms();
        })
    }

    /**
     * Удаляет транзакцию (доход или расход). Требует
     * подтверждеия действия (с помощью confirm()).
     * По удалению транзакции вызовите метод App.update(),
     * либо обновляйте текущую страницу (метод update) и виджет со счетами
     * */
    removeTransaction(id) {
        Transaction.remove({ id: id }, (err, response) => {
            if (response && response.success) {
                App.update();
            } else {
                console.log(err);
            }
        })
    }

    /**
     * С помощью Account.get() получает название счёта и отображает
     * его через TransactionsPage.renderTitle.
     * Получает список Transaction.list и полученные данные передаёт
     * в TransactionsPage.renderTransactions()
     * */
    render(options) {
        if (!options) {
            return;
        }

        this.lastOptions = options;

        Account.get(options.account_id, (err, response) => {
            if (response && response.success) {
                this.renderTitle(response.data.name);
            } else {
                console.log(err);
            }
        });

        Transaction.list(options, (err, response) => {
            if (response && response.success) {
                this.renderTransactions(response.data);
            } else {
                console.log(err);
            }
        });
    }

    /**
     * Очищает страницу. Вызывает
     * TransactionsPage.renderTransactions() с пустым массивом.
     * Устанавливает заголовок: «Название счёта»
     * */
    clear() {
        this.element.querySelector('.content').innerHTML = '';
        this.renderTransactions([]);
        this.renderTitle('Название счёта');
        this.lastOptions = '';
    }

    /**
     * Устанавливает заголовок в элемент .content-title
     * */
    renderTitle(name) {
        const title = this.element.querySelector('.content-title');
        title.textContent = name;
    }

    /**
     * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
     * в формат «10 марта 2019 г. в 03:20»
     * */
    formatDate(date) {
        const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        const newDate = new Date(date);

        let hours = newDate.getHours();
        let minutes = newDate.getMinutes();
        if (hours < 10) {
            hours = `0${hours}`
        }
        if (minutes < 10) {
            minutes = `0${minutes}`
        }

        return `${newDate.getDate()} ${months[newDate.getMonth()]} ${newDate.getFullYear()} г. в ${hours}:${minutes}`;
    }

    /**
     * Формирует HTML-код транзакции (дохода или расхода).
     * item - объект с информацией о транзакции
     * */
    getTransactionHTML(item) {
        return `<div class="transaction transaction_${item.type} row">
        <div class="col-md-7 transaction__details">
          <div class="transaction__icon">
              <span class="fa fa-money fa-2x"></span>
          </div>
          <div class="transaction__info">
              <h4 class="transaction__title">${item.name}</h4>
              <!-- дата -->
              <div class="transaction__date">${this.formatDate(item.created_at)}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="transaction__summ">
          <!--  сумма -->
              ${item.sum} <span class="currency">₽</span>
          </div>
        </div>
        <div class="col-md-2 transaction__controls">
            <!-- в data-id нужно поместить id -->
            <button class="btn btn-danger transaction__remove" data-id="${item.id}">
                <i class="fa fa-trash"></i>  
            </button>
        </div>
    </div>`;
    }

    /**
     * Отрисовывает список транзакций на странице
     * используя getTransactionHTML
     * */
    renderTransactions(data) {
        const wrapper = this.element.querySelector('.content');
        wrapper.innerHTML = '';

        data.map(item => {
            wrapper.insertAdjacentHTML('beforeend', this.getTransactionHTML(item));
        });
    }
}