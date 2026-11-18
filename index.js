const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const PORT = 3000;

// Проміжне ПЗ (Middleware) для обробки JSON та CORS-запитів
app.use(cors());
app.use(express.json());

// Підключення до бази даних PostgreSQL (Supabase)
const supabaseUrl = 'https://bmxncmpwumbxuqtnuaok.supabase.co';
const supabaseKey = 'sb_publishable_LmZXOA3cx7SNPeVyha1frw_RB5Ko9-3';
const supabase = createClient(supabaseUrl, supabaseKey);

// Підключення OpenAPI (Swagger) документації
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// REST API: Отримання всіх записів (GET)
app.get('/api/tasks', async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
});

// REST API: Збереження нового запису (POST)
app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Поле title є обов’язковим' });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ title }])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data[0]);
});

// Запуск HTTP-сервера
app.listen(PORT, () => {
  console.log(`Сервер запущено за адресою: http://localhost:${PORT}`);
  console.log(`Документація OpenAPI доступна за адресою: http://localhost:${PORT}/api-docs`);
});