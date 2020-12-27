# iCal

[![Node.js CI](../../workflows/Node.js%20CI/badge.svg)](../../actions?query=workflow%3A%22Node.js+CI%22)
[![Maintainability](https://api.codeclimate.com/v1/badges/e23f92e76fd6a091df61/maintainability)](https://codeclimate.com/github/Melodyn/iCal/maintainability)

|![логотип](./logo.png)|Node.js-приложение для vk.com. Разрабатывается в формате лайвкодинга
|---|---|

Ссылки:
* стримы с разработкой: https://www.youtube.com/playlist?list=PLxqZB2PTPdc7RSb5QpFR1lJ27NEmHtaYa
* бэкенд приложения: https://melodyn-ical.herokuapp.com/


## Установка и запуск

Требования:
* Node.js >= 14;
* npm >= 6.14;
* (опционально) make >= 4;
* (опционально) docker >= 20;
* (опционально) heroku >= 7.47.

Разворачивание:
* Клонировать этот репозиторий;
* `make setup` для установки первый раз.

Использование
* `make run` запуск приложения;
* **или** `make run-heroku` для запуска как хероку-приложения.

Ещё команды:
* `make test` - запустить тесты;
* `make lint` - запустить линтер;
* `container-setup` - установка и запуск в docker-контейнере.
* `container-run` - запуск docker-контейнера с приложением. Далее - `make run` внутри контейнера.


### Как это работает

`make setup` запустит установку зависимостей, из example-конфига создаст девелоперский конфиг и запустит с ним приложение. 
