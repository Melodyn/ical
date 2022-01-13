# ical

|![логотип](logo.png)|<center>Google-календарь и виджет в сообщество ВКонтакте.<br/><br/> [![Maintainability](https://img.shields.io/badge/vk%20mini%20app-open-blue)](https://vk.com/app7703913) [![Maintainability](https://api.codeclimate.com/v1/badges/e23f92e76fd6a091df61/maintainability)](https://codeclimate.com/github/Melodyn/iCal/maintainability) </center>
|---|---|
|[Frontend](https://github.com/Melodyn/ical/tree/frontend)|[![Frontend Test Coverage](https://api.codeclimate.com/v1/badges/e23f92e76fd6a091df61/test_coverage)](https://codeclimate.com/github/Melodyn/iCal/test_coverage) [![Frontend Production](../../actions/workflows/frontend.yml/badge.svg?branch=frontend)](../../actions/workflows/frontend.yml?query=workflow%3A"Frontend+Production")
|[Backend](https://github.com/Melodyn/ical/tree/backend)|[![Backend Test Coverage](https://codecov.io/gh/Melodyn/ical/branch/main/graph/badge.svg?token=XVWH9NL1PW)](https://codecov.io/gh/Melodyn/ical) [![Backend production](../../workflows/Production%20CI/badge.svg)](../../actions?query=workflow%3A"Production+CI") [![Backend staging](../../workflows/Staging%20CI/badge.svg)](../../actions?query=workflow%3A"Staging+CI")


Ссылки:
* **доска задач**: https://github.com/users/Melodyn/projects/1
* стримы с разработкой: https://www.youtube.com/playlist?list=PLxqZB2PTPdc7RSb5QpFR1lJ27NEmHtaYa
* фронтенд приложения: https://melodyn.github.io/ical/
* бэкенд приложения: https://melodyn-ical.herokuapp.com/
* приложение в vk: https://vk.com/app7703913

## Установка и запуск

Требования:
* Node.js >= 14;
* npm >= 6.14;
* (опционально) make >= 4;
* (опционально) docker >= 20;
* (опционально) docker compose >= 1.29;

Развёртывание (без докера):
* Клонировать этот репозиторий;
* Перейти в нужную ветку (frontend / backend)
* `make setup` для установки первый раз.

Использование
* `make run` запуск приложения;
* **или для бэкенда** `make run-heroku` для запуска как хероку-приложения.

Ещё команды:
* `make test` - запустить тесты;
* `make lint` - запустить линтер; Настройка линтера под IDEA с Docker: https://youtrack.jetbrains.com/issue/WEB-20824#focus=Comments-27-5106498.0-0
* `container-setup` - установка и запуск в docker-контейнере.
* `container-run` - запуск docker-контейнера с приложением. Далее - `make run` внутри контейнера или другие команды.


### Как это работает

`make setup` на бэкенде запустит установку зависимостей, из example-конфига создаст девелоперский конфиг и запустит с ним приложение.

`make setup` на фронтенде запустит установку зависимостей и запустит приложение через webpack-dev-server.


## Права

Исходный код и стримы с разработкой приложения являются частью демонстрации экосистемы JavaScript, её сложностей, особенностей и возможных подходов к разработке. Исходный код распространяется под лицензией [GNU GPLv3](./LICENSE.txt). Использование кода без согласования с автором запрещено. 
