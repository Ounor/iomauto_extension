const MODULE_STATUS = {
    START_SERVICE: 'START_SERVICE',
    NEW: 'NEW',
    SEARCHING: 'SEARCH',
    WAIT_QA_FORM: 'WAIT_QA_FORM',
    READY: 'READY',
    EXECUTING: 'EXECUTING',
    DONE: 'DONE',
    ERROR: 'ERROR',
}

const MODULE_STATUS_TEXT_MAP = {
    [MODULE_STATUS.START_SERVICE]: ['*', '#ffd200', 'Ожидаю запуска теста'],
    [MODULE_STATUS.NEW]: ['*', '#ffd200', 'Ожидаю запуска теста'],
    [MODULE_STATUS.SEARCHING]: ['...', '#ffd200', 'Поиск ответов в интернете...'],
    [MODULE_STATUS.WAIT_QA_FORM]: ['...', '#ffd200', 'Ожидаю формы вопросов'],
    [MODULE_STATUS.READY]: ['>', '#00ff07', 'Ответы найдены - нажмите для запуска!'],
    [MODULE_STATUS.EXECUTING]: ['>...', '#ffd200', 'Подстановка ответов...'],
    [MODULE_STATUS.DONE]: ['DONE', '#165af3', 'Все подставлено!'],
    [MODULE_STATUS.ERROR]: ['ER', '#ec0303', 'ОШИБКА'],
}

const startBtn = document.getElementById("handleStart");
const settingsBtn = document.getElementById("handleSettings");
const arrowBtn = document.getElementById("handleOutSettings");
const saveBtn = document.getElementById("handleSave");
const settingsBlock = document.getElementById("settingsBlock");
const workBlock = document.getElementById("workBlock");

// Получение сохраненных данных при загрузке popup.html
document.addEventListener('DOMContentLoaded', () => {



    chrome.storage.local.get(['settings, moduleStatus'], (result) => {
        if (result.settings) {
            const settingsData = result.settings;
            // Подстановка данных в инпуты
            document.getElementById('minValue').value = settingsData.minValue || '';
            document.getElementById('maxValue').value = settingsData.maxValue || '';
        }
    });
});

// Сохранить
saveBtn.addEventListener('click', () => {
    const minValue = document.getElementById('minValue').value || 4;
    const maxValue = document.getElementById('maxValue').value || 8;
    const inputData = { minValue, maxValue };

    chrome.storage.local.set({ settings: inputData }, () => {
        console.log('Data saved in storage');
    });
    // Закрываем popup
    window.close();
});

// Переход в настройки
settingsBtn.addEventListener('click', () => {
    settingsBlock.classList.remove("hide");
    workBlock.classList.add("hide");
});

// Выход из настроек в настройки
arrowBtn.addEventListener('click', () => {
    settingsBlock.classList.add("hide");
    workBlock.classList.remove("hide");
});


startBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "onStart" });

    chrome.storage.sync.get(({
                                 moduleStatus,
                                 error,
                             }) => {
        console.log('onStart')
        console.log('bg: action: ', moduleStatus, error)
        switch (moduleStatus) {
            case MODULE_STATUS.ERROR:
                navigator.clipboard.writeText(error)
                break;
            case MODULE_STATUS.READY:
                chrome.storage.sync.set({
                    moduleStatus: MODULE_STATUS.EXECUTING,
                })
                break;
            default:
                // reset
                // todo @ANKU @LOW - нужно включать интервал заново
                chrome.storage.sync.set({
                    moduleStatus: MODULE_STATUS.NEW,
                    error: undefined,
                })
        }
    })

    // Закрываем popup
    window.close();
});


// Следим за изменениями в storage и подставляем статусы
chrome.storage.onChanged.addListener((changes, area) => {
    document.getElementById('status').innerHTML = `<h4>${MODULE_STATUS_TEXT_MAP[changes.moduleStatus.newValue][2]}</h4>`
});
