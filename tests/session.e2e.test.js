import {chromium} from 'playwright';
import {httpServer, io} from '../server.js';

let browser, page;

beforeAll(async () => {
    await new Promise((resolve) => {
        httpServer.listen(3001, 'localhost', () => {
            resolve();
        });
    });

    browser = await chromium.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3001', {waitUntil: 'domcontentloaded'});
});

afterAll(async () => {
    await browser.close();
    await new Promise((resolve) => httpServer.close(resolve));
});

describe('Test de la session utilisateur', () => {
    test('Session utilisateur comppléte: envoie et réception dun message', async () => {
        // Vérifier que le champ de pseudo est visible
        await page.waitForSelector('#pseudoInput');
        // Entrer un pseudo et cliquer sur le bouton
        await page.fill('#pseudoInput', 'TestUser');
        await page.click('#pseudoButton');
        // Vérifier que le formulaire de message est maintenant visible
        await page.waitForSelector('#form');
        // Entrer un message et soumettre le formulaire
        await page.fill('#input', 'Hello, this is a test message!');
        await page.click('button[type="submit"], #form button');
        // Vérifier que le message apparaît dans la liste des messages
        await page.waitForSelector('#messages li', { timeout: 8000 });
        const messages = await page.$$eval('#messages li', items => items.map(item => item.textContent));
        expect(messages).toContain('TestUser : Hello, this is a test message!');
    });
});