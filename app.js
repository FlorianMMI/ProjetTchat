import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Twig from 'twig';



// Pour __dirname et __filename en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();


// Configure Twig view engine
app.set('views', __dirname);
app.set('view engine', 'twig');
app.engine('twig', Twig.__express);

app.use(express.static(join(__dirname, 'public')));

app.get('/', function(req, res){
  res.render('home', {});
});

export default app; // Exporter l'application pour les tests
