/**
 * Класс CreateTransactionForm управляет формой
 * создания новой транзакции
 * */
class CreateTransactionForm extends AsyncForm {
    /**
     * Вызывает родительский конструктор и
     * метод renderAccountsList
     * */
    constructor(element) {
        super(element);
        this.renderAccountsList();
    }

    /**
     * Получает список счетов с помощью Account.list
     * Обновляет в форме всплывающего окна выпадающий список
     * */
    renderAccountsList() {
        const accountSelect = this.element.querySelector('.accounts-select');

        Account.list(User.current(), (err, response) => {
            if (response && response.success) {
                const bills = response.data.reduce((bills, current) => {
                    const option = `<option value="${current.id}">${current.name}</option>`;
                    return bills + option;
                }, '');
                accountSelect.innerHTML = bills;
            } else {
                console.log(err);
            }
        });
    }

    /**
     * Создаёт новую транзакцию (доход или расход)
     * с помощью Transaction.create. По успешному результату
     * вызывает App.update(), сбрасывает форму и закрывает окно,
     * в котором находится форма
     * */
    onSubmit(data) {
        Transaction.create(data, (err, response) => {
            if (response && response.success) {
                this.element.reset();
                App.getModal('newIncome').close();
                App.getModal('newExpense').close();
                App.update();
            } else {
                console.log(err);
            }
        });
    }
}