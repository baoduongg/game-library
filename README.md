# Game Library - React.js Project

## 📋 Mô tả dự án

Game Library là một ứng dụng quản lý thư viện game được xây dựng bằng React.js và Tailwind CSS.

## 🛠️ Công nghệ sử dụng

- **React.js** (v19.2.0) - Framework UI
- **Vite** - Build tool & development server
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting

## 📁 Cấu trúc dự án

```
src/
├── components/          # React components
│   ├── common/         # Các component dùng chung (Button, Card, v.v.)
│   └── layout/         # Các component layout (Header, Footer, Layout)
├── pages/              # Các trang của ứng dụng
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── services/           # API services
├── contexts/           # React contexts
├── constants/          # Constants và cấu hình
├── assets/             # Static assets (images, icons, v.v.)
├── App.jsx             # Root component
├── main.jsx            # Entry point
└── index.css           # Global styles với Tailwind
```

## 🚀 Bắt đầu

### Cài đặt dependencies

```bash
npm install
```

### Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### Build production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint code

```bash
npm run lint
```

## 📦 Components có sẵn

### Layout Components
- **Header**: Navigation bar
- **Footer**: Footer component
- **Layout**: Wrapper layout với header và footer

### Common Components
- **Button**: Component button với nhiều variants (primary, secondary, outline)
- **Card**: Card component với hover effects

## 🎨 Tailwind CSS

Dự án sử dụng Tailwind CSS để styling. Bạn có thể tùy chỉnh theme trong file `tailwind.config.js`.

### Ví dụ sử dụng Tailwind classes:

```jsx
<div className="container mx-auto px-4 py-8">
  <h1 className="text-4xl font-bold text-gray-900">Hello World</h1>
</div>
```

## 🔧 Custom Hooks

- **useLocalStorage**: Hook để quản lý localStorage

## 🌐 API Service

File `src/services/api.js` cung cấp một class cơ bản để thực hiện các HTTP requests:

```javascript
import apiService from './services/api';

// GET request
const data = await apiService.get('/endpoint');

// POST request
const result = await apiService.post('/endpoint', { data });
```

## 📝 Utils

File `src/utils/helpers.js` chứa các utility functions:
- `formatDate`: Format date
- `truncateText`: Cắt ngắn text
- `generateId`: Tạo unique ID

## ⚙️ Configuration

### Environment Variables

Tạo file `.env` trong root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

## 📄 License

MIT
