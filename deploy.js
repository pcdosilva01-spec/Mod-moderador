require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const token = process.env.DISCORD_TOKEN || process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const commandsPath = path.join(__dirname, 'commands');

if (!token || !clientId) {
  console.error('❌ Configure DISCORD_TOKEN e CLIENT_ID no arquivo .env.');
  process.exit(1);
}

if (!fs.existsSync(commandsPath)) {
  console.error('❌ A pasta commands não foi encontrada.');
  process.exit(1);
}

const commands = [];
const files = fs.readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of files) {
  const filePath = path.join(commandsPath, file);

  try {
    delete require.cache[require.resolve(filePath)];
    const command = require(filePath);

    if (!command.data || typeof command.execute !== 'function') {
      console.warn(`⚠️ ${file} ignorado: exporte "data" e "execute".`);
      continue;
    }

    const data = typeof command.data.toJSON === 'function'
      ? command.data.toJSON()
      : command.data;

    if (!data.name || !data.description) {
      console.warn(`⚠️ ${file} ignorado: data.name ou data.description ausente.`);
      continue;
    }

    commands.push(data);
    console.log(`✅ Preparado: /${data.name}`);
  } catch (error) {
    console.error(`❌ Erro ao ler ${file}:`, error.message);
  }
}

if (commands.length === 0) {
  console.error('❌ Nenhum comando válido foi encontrado. Nenhum comando existente foi apagado.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);
const route = guildId
  ? Routes.applicationGuildCommands(clientId, guildId)
  : Routes.applicationCommands(clientId);

(async () => {
  try {
    console.log(`🔄 Registrando ${commands.length} comando(s) ${guildId ? 'no servidor de desenvolvimento' : 'globalmente'}...`);
    await rest.put(route, { body: commands });
    console.log('✅ Todos os comandos foram registrados com sucesso.');
  } catch (error) {
    console.error('❌ Falha ao registrar os comandos:', error.message);
    process.exitCode = 1;
  }
})();
