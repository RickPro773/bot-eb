const { EmbedBuilder } = require('discord.js');

const CORES = {
  verde: 0x2E7D32,
  vermelho: 0xC62828,
  amarelo: 0xF9A825,
  azul: 0x1565C0,
  cinza: 0x546E7A,
  ouro: 0xFFD600,
};

function embedEB(titulo, descricao, cor = 'verde', fields = []) {
  return new EmbedBuilder()
    .setColor(CORES[cor] || CORES.verde)
    .setTitle(`🎖️ ${titulo}`)
    .setDescription(descricao)
    .addFields(fields)
    .setFooter({ text: '⚔️ Exército Brasileiro — Servidor MilSim' })
    .setTimestamp();
}

function embedAviso(tipo, mensagem, autor) {
  const configs = {
    urgente:   { emoji: '🚨', cor: CORES.vermelho, titulo: 'AVISO URGENTE' },
    operacao:  { emoji: '⚔️', cor: CORES.verde,   titulo: 'OPERAÇÃO MILITAR' },
    treino:    { emoji: '🎯', cor: CORES.azul,     titulo: 'TREINO/EXERCÍCIO' },
    reuniao:   { emoji: '📋', cor: CORES.amarelo,  titulo: 'REUNIÃO' },
    formatura:  { emoji: '🫡', cor: CORES.ouro,    titulo: 'FORMATURA' },
    geral:     { emoji: '📢', cor: CORES.cinza,    titulo: 'AVISO GERAL' },
  };
  const cfg = configs[tipo] || configs.geral;
  return new EmbedBuilder()
    .setColor(cfg.cor)
    .setTitle(`${cfg.emoji} ${cfg.titulo}`)
    .setDescription(mensagem)
    .addFields({ name: '👤 Emitido por', value: autor, inline: true })
    .setFooter({ text: '⚔️ Exército Brasileiro — Servidor MilSim' })
    .setTimestamp();
}

module.exports = { embedEB, embedAviso, CORES };
