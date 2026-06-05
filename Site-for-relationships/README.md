# 💘 Crush – Site for Relationships

Уеб приложение за запознанства (dating app), изградено с **React** фронтенд, **PHP** бекенд API и **MySQL** база данни. Проектът е напълно контейнеризиран с **Docker** и **Docker Compose**.

---

## 📋 Съдържание

- [Структура на проекта](#структура-на-проекта)
- [Компоненти](#компоненти)
- [Комуникация между услугите](#комуникация-между-услугите)
- [Стартиране с Docker Compose](#стартиране-с-docker-compose)
- [Изграждане на образите](#изграждане-на-образите)
- [DockerHub образи](#dockerhub-образи)
- [Среди и конфигурация](#среди-и-конфигурация)
- [API Endpoints](#api-endpoints)

---

## 📁 Структура на проекта

```
Site-for-relationships/
├── backend/                   # PHP бекенд (API)
│   ├── Dockerfile             # Docker образ за бекенда
│   ├── .dockerignore          # Изключени файлове от Docker контекста
│   ├── .htaccess              # Apache URL пренасочване
│   ├── index.php              # Главен роутер / входна точка
│   ├── auth.php               # JWT автентикация
│   ├── db.php                 # PDO връзка към базата данни
│   ├── config.php             # Конфигурация (локално)
│   ├── config.docker.php      # Конфигурация (Docker – чете от ENV)
│   └── uploads/               # Качени снимки от потребители
│
├── frontend/                  # React фронтенд
│   ├── Dockerfile             # Multi-stage Docker образ (Node → Nginx)
│   ├── .dockerignore          # Изключени файлове от Docker контекста
│   ├── nginx.conf             # Nginx конфигурация за SPA + API proxy
│   ├── package.json           # NPM зависимости
│   ├── public/                # Статични файлове
│   └── src/                   # React сорс код
│       ├── components/        # React компоненти
│       ├── context/           # React Context (state management)
│       ├── lib/               # Помощни библиотеки / API клиент
│       ├── pages/             # Страници (маршрути)
│       ├── App.js             # Главен App компонент
│       └── index.js           # Входна точка на React
│
├── database/                  # SQL скриптове за базата данни
│   ├── schema.sql             # DDL – създаване на таблици
│   └── seed.sql               # Примерни данни (demo потребители)
│
├── compose.yml                # Docker Compose конфигурация
└── README.md                  # Тази документация
```

---

## 🧩 Компоненти

### 1. 🗄️ База данни (MySQL 8.0)

- **Образ:** `mysql:8.0` (официален Docker Hub образ)
- **Описание:** Съхранява всички данни – потребители, снимки, суайпове, мачове и съобщения
- **База:** `crush_db` с UTF-8 (utf8mb4) колация
- **Таблици:** `Users`, `Photos`, `Swipes`, `Matches`, `Messages`
- **Инициализация:** SQL скриптовете от `database/` се изпълняват автоматично при първо стартиране чрез Docker `initdb.d` механизма
- **Том:** `db_data` – персистентно съхранение на данните

### 2. ⚙️ Бекенд (PHP 8.2 + Apache)

- **Образ:** `danig55/crush-backend:latest`
- **Описание:** RESTful API, написан на чист PHP (без фреймуърк)
- **Функции:**
  - Регистрация и вход (JWT автентикация)
  - CRUD за потребителски профили
  - Качване и управление на снимки
  - Swipe система (like/pass)
  - Мачове и съобщения
  - Админ панел (статистики, управление)
- **Конфигурация:** Чете от ENV променливи (`DB_HOST`, `DB_USER`, `DB_PASS`, `JWT_SECRET` и др.)
- **Том:** `upload_data` – персистентно съхранение на качените снимки

### 3. 🌐 Фронтенд (React + Nginx)

- **Образ:** `danig55/crush-frontend:latest`
- **Описание:** Single Page Application (SPA) изградено с React 18
- **Multi-stage build:**
  1. **Етап 1:** Node.js 18 – инсталира зависимости и билдва production bundle
  2. **Етап 2:** Nginx 1.25 – сервира статичните файлове
- **Библиотеки:** React Router, Axios, Framer Motion, Lucide React
- **Nginx:** Конфигуриран да обслужва SPA (fallback към `index.html`) и да проксира `/api/` заявки към бекенда

---

## 🔗 Комуникация между услугите

```
┌─────────────┐      HTTP :3000       ┌──────────────┐
│  Потребител  │ ◄──────────────────► │   Frontend   │
│  (Браузър)  │                       │  (Nginx)     │
└─────────────┘                       └──────┬───────┘
                                             │
                                    /api/*   │  proxy_pass
                                             ▼
                                      ┌──────────────┐
                                      │   Backend    │
                                      │ (PHP+Apache) │
                                      └──────┬───────┘
                                             │
                                      PDO    │  MySQL protocol
                                             ▼
                                      ┌──────────────┐
                                      │   Database   │
                                      │   (MySQL)    │
                                      └──────────────┘
```

| От → Към | Протокол | Описание |
|---|---|---|
| Браузър → Frontend | HTTP (порт 3000) | Потребителят зарежда React приложението |
| Frontend (Nginx) → Backend | HTTP (вътрешен порт 80) | Nginx проксира `/api/*` заявки към PHP бекенда |
| Backend → Database | MySQL (вътрешен порт 3306) | PHP използва PDO за SQL заявки към MySQL |

**Мрежа:** Всички контейнери са свързани в обща Docker bridge мрежа `crush-network`, която позволява комуникация по имена на услуги (DNS resolution).

---

## 🚀 Стартиране с Docker Compose

### Предварителни изисквания

- [Docker](https://docs.docker.com/get-docker/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)

### Стъпки

1. **Клониране на хранилището:**

```bash
git clone https://github.com/Danig55/Site-for-relationships.git
cd Site-for-relationships
```

2. **Изграждане и стартиране на всички контейнери:**

```bash
docker compose up --build -d
```

3. **Проверка на статуса:**

```bash
docker compose ps
```

4. **Достъп до приложението:**

| Услуга | URL |
|---|---|
| Фронтенд (уеб интерфейс) | http://localhost:3000 |
| Бекенд API (директен достъп) | http://localhost:8080 |
| MySQL (за инструменти) | `localhost:3307` |

5. **Спиране на контейнерите:**

```bash
docker compose down
```

6. **Спиране и изтриване на данните (volumes):**

```bash
docker compose down -v
```

---

## 🏗️ Изграждане на образите

### Бекенд

```bash
docker build -t danig55/crush-backend:latest ./backend
```

### Фронтенд

```bash
docker build -t danig55/crush-frontend:latest ./frontend
```

### Качване в Docker Hub

```bash
docker push danig55/crush-backend:latest
docker push danig55/crush-frontend:latest
```

---

## 🐳 DockerHub образи

| Образ | Описание | Линк |
|---|---|---|
| `danig55/crush-backend:latest` | PHP 8.2 + Apache бекенд API | [Docker Hub](https://hub.docker.com/r/danig55/crush-backend) |
| `danig55/crush-frontend:latest` | React + Nginx фронтенд | [Docker Hub](https://hub.docker.com/r/danig55/crush-frontend) |

> **Забележка:** Базата данни използва официалния `mysql:8.0` образ и не изисква собствен Dockerfile.

---

## ⚙️ Среди и конфигурация

### Променливи на средата (Environment Variables)

Бекендът чете конфигурацията от следните ENV променливи (зададени в `compose.yml`):

| Променлива | Описание | Стойност по подразбиране |
|---|---|---|
| `DB_HOST` | Хост на MySQL сървъра | `db` (име на Docker услугата) |
| `DB_PORT` | Порт на MySQL | `3306` |
| `DB_NAME` | Име на базата данни | `crush_db` |
| `DB_USER` | MySQL потребител | `crush_user` |
| `DB_PASS` | MySQL парола | `crush_pass` |
| `JWT_SECRET` | Секретен ключ за JWT токени | (зададен в compose.yml) |
| `JWT_HOURS` | Валидност на JWT в часове | `24` |
| `CORS_ORIGIN` | Разрешен CORS origin | `*` |

### Demo акаунти (от seed.sql)

| Email | Парола | Роля |
|---|---|---|
| admin@crush.app | admin123 | Администратор |
| ivan@crush.app | 123456 | Потребител |
| maria@crush.app | 123456 | Потребител |

---

## 📡 API Endpoints

| Метод | Път | Описание |
|---|---|---|
| `POST` | `/api/auth/register` | Регистрация на нов потребител |
| `POST` | `/api/auth/login` | Вход (JWT) |
| `GET` | `/api/profile/me` | Текущ профил |
| `PUT` | `/api/profile/me` | Редакция на профил |
| `DELETE` | `/api/profile` | Изтриване на профил |
| `GET` | `/api/profile/photos` | Списък снимки |
| `POST` | `/api/profile/photos` | Качване на снимка |
| `DELETE` | `/api/profile/photos/:id` | Изтриване на снимка |
| `GET` | `/api/feed` | Потребители за суайпване |
| `POST` | `/api/swipes` | Суайп (like/pass) |
| `GET` | `/api/matches` | Списък мачове |
| `GET` | `/api/matches/:id/messages` | Съобщения в мач |
| `POST` | `/api/matches/:id/messages` | Изпращане на съобщение |
| `GET` | `/api/admin/stats` | Админ статистики |
| `GET` | `/api/admin/users` | Админ – всички потребители |
| `DELETE` | `/api/admin/users/:id` | Админ – изтриване потребител |
| `GET` | `/api/admin/matches` | Админ – всички мачове |
| `GET` | `/api/admin/messages` | Админ – всички съобщения |

---

## 📄 Лиценз

Този проект е създаден за учебни цели.
