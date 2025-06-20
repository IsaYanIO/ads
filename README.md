## Создание файла `.env`

В корне проекта создать файл `.env` и пропиши в нем jwt_secret

```
JWT_SECRET=some-very-secret-key
```

## Установка Node js

https://nodejs.org/en

## Запуск проекта

Установка зависимостей:

```
npm install

```

При возникновении ошибки c npm install пропишите сначала

```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

```

Генерация клиента Prisma

```
npx prisma generate
```

Применения изменений к БД

```
npx prisma db push
```

Посев данных

```
npx prisma db seed
```

Запуск Next.js

```
npm run dev
```

## Наполнить БД данными

Наполнение БД начальными данными

```
$2b$10$QRqib43G528vDM4wF1Ialu3X3yT2Oty0BNcciMOykjl4clWC0UK2K - пароль 12345678
```

## Тестирование API (Insomnia)

API реализовано на Next.js и протестировано через **Insomnia**.
Скачать Insomnia можно по ссылке "https://insomnia.rest/download", затем нужно авторизоваться

### Импорт коллекции

1. Откройте **Insomnia**.
2. Нажмите на `Import` → `From File`.
3. Выберите файл `Insomnia.yaml`
4. Insomnia автоматически создаст структуру запросов.

### Переменные окружения

Добавьте в среду окружения `Base Environment`:

```
"url": "localhost:3000/api"
```

### 📚 Основные эндпоинты

#### 🗂 Категории (`/category`)

- **POST** `/category` — создать
- **GET** `/category` — получить все
- **GET** `/category/:id` — получить по ID
- **PATCH** `/category/:id` — изменить
- **DELETE** `/category/:id` — удалить

#### 📢 Объявления (`/ads`)

- **POST** `/ads` — создать
- **GET** `/ads` — получить все (поддерживает фильтры: `categoryId`, `minPrice`, `maxPrice`, `sortByPrice`)
- **GET** `/ads/:id` — получить по ID
- **PATCH** `/ads/:id` — обновить
- **DELETE** `/ads/:id` — удалить

#### 💬 Ответы на объявления (`/response`)

- **POST** `/response` — создать
- **GET** `/response` — получить все мои
- **GET** `/response/:id` — получить по ID
- **PATCH** `/response/:id` — обновить
- **DELETE** `/response/:id` — удалить

#### 🔐 Аутентификация

- **POST** `/auth/login` — логин (`email: "admin", password: "12345678"`)
- **POST** `/auth/logout` — выход

## ✅ Примечание

- Для всех запросов, кроме аутентификации, **необходима авторизация (cookie с `token`)**.
- После логина Insomnia автоматически сохраняет токен в Cookie Jar.



