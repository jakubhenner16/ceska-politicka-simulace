ČESKÁ POLITICKÁ SIMULACE V6

1. Nainstaluj Node.js.
2. Otevři terminál v této složce.
3. Spusť:
   npm install
4. Zkopíruj .env.example jako .env.
5. Do .env vlož svůj API klíč.
6. Spusť:
   npm start
7. Otevři http://localhost:3000

DŮLEŽITÉ:
- API klíč patří pouze do .env, nikdy do index.html.
- Bez API klíče hra stále funguje přes lokální fallback.
- V6 má připravené dynamické barvení krajů podle podpory strany.
- Pro přesné skutečné hranice lze později vložit V5 polygonová data do POLYS.
