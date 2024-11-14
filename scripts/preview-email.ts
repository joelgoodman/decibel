import 'dotenv/config';
import express from 'express';
import { compileTemplate } from '../src/lib/email/compiler';
import { readFileSync } from 'fs';
import { join } from 'path';

const app = express();
const port = 3002;

app.use(express.json());

// Sample data for preview
const sampleData = {
  site_name: 'Decibel',
  logo_url: 'https://example.com/logo.png',
  unsubscribe_url: '#',
  preferences_url: '#',
  subscriber: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  post: {
    title: 'Sample Post Title',
    description: 'This is a sample post description for preview purposes.',
    featured_image: 'https://example.com/sample.jpg',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    url: '#'
  }
};

app.get('/preview/:template', (req, res) => {
  try {
    const templatePath = join(__dirname, '../src/lib/email/templates', `${req.params.template}.mjml`);
    const templateContent = readFileSync(templatePath, 'utf-8');
    
    const html = compileTemplate(templateContent, {
      ...sampleData,
      ...req.query
    });

    res.send(html);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to preview template'
    });
  }
});

app.listen(port, () => {
  console.log(`Email preview server running at http://localhost:${port}`);
  console.log('Available templates:');
  console.log('- http://localhost:3002/preview/newsletter');
  console.log('- http://localhost:3002/preview/welcome');
});