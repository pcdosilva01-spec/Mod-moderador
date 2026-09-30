require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes
} = require('discord.js');

const token = process.env.DISCORD_TOKEN || process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
  console.error('❌ Token ausente. Defina DISCORD_TOKEN no arquivo .env.');
  process.exit(1);
}

if (!clientId) {
  console.error('❌ CLIENT_ID ausente. Defina CLIENT_ID no arquivo .env.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
const commandPayload = [];
const commandsPath = path.join(__dirname, 'commands');

function loadCommands() {
  if (!fs.existsSync(commandsPath)) {
    console.warn('⚠️ A pasta commands não foi encontrada.');
    return;
  }

  const commandFiles = fs.readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    try {
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);

      // Comandos devem exportar: { data, execute }
      if (!command.data || typeof command.execute !== 'function') {
        console.warn(`⚠️ ${file} ignorado: exporte "data" e "execute".`);
        continue;
      }

      const data = typeof command.data.toJSON === 'function'
        ? command.data.toJSON()
        : command.data;

      if (!data.name) {
        console.warn(`⚠️ ${file} ignorado: o comando não possui nome.`);
        continue;
      }

      client.commands.set(data.name, command);
      commandPayload.push(data);
      console.log(`✅ Comando carregado: /${data.name}`);
    } catch (error) {
      console.error(`❌ Não foi possível carregar ${file}:`, error.message);
    }
  }
}

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(token);
  const route = guildId
    ? Routes.applicationGuildCommands(clientId, guildId)
    : Routes.applicationCommands(clientId);

  await rest.put(route, { body: commandPayload });
  console.log(`✅ ${commandPayload.length} comando(s) registrado(s)${guildId ? ' no servidor de desenvolvimento' : ' globalmente'}.`);
}

client.once('ready', async (readyClient) => {
  console.log(`✅ ${readyClient.user.tag} conectado. Servidores: ${readyClient.guilds.cache.size}`);

  try {
    await registerCommands();
  } catch (error) {
    console.error('❌ Erro ao registrar os comandos:', error.message);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({
      content: '❌ Este comando não está disponível no momento.',
      ephemeral: true
    }).catch(() => undefined);
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(`❌ Erro ao executar /${interaction.commandName}:`, error);

    const response = {
      content: '❌ Ocorreu um erro ao executar este comando.',
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response).catch(() => undefined);
    } else {
      await interaction.reply(response).catch(() => undefined);
    }
  }
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Promise rejeitada:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
});

loadCommands();

client.login(token).catch((error) => {
  console.error('❌ Não foi possível conectar ao Discord:', error.message);
  process.exitCode = 1;
});
