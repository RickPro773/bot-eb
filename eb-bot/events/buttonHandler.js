const { Events, EmbedBuilder } = require('discord.js');
const { readDB, writeDB } = require('../utils/db');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    const { customId, guild, user } = interaction;

    // Operation buttons
    if (customId.startsWith('op_confirmar_')) {
      const id = customId.replace('op_confirmar_', '');
      const db = readDB('operacoes');
      const op = db[guild.id]?.[id];
      if (!op) return interaction.reply({ content: '❌ Operação não encontrada.', ephemeral: true });

      if (op.confirmados.includes(user.id)) {
        return interaction.reply({ content: '⚠️ Você já confirmou presença nesta operação.', ephemeral: true });
      }

      if (op.vagas > 0 && op.confirmados.length >= op.vagas) {
        return interaction.reply({ content: '❌ Vagas esgotadas para esta operação.', ephemeral: true });
      }

      op.confirmados.push(user.id);
      writeDB('operacoes', db);

      await interaction.reply({
        content: `✅ **${user.username}**, sua presença foi confirmada na operação **${op.nome}**! Esteja pronto. 🎖️`,
        ephemeral: true,
      });
    }

    if (customId.startsWith('op_cancelar_')) {
      const id = customId.replace('op_cancelar_', '');
      const db = readDB('operacoes');
      const op = db[guild.id]?.[id];
      if (!op) return interaction.reply({ content: '❌ Operação não encontrada.', ephemeral: true });

      op.confirmados = op.confirmados.filter(uid => uid !== user.id);
      writeDB('operacoes', db);

      await interaction.reply({ content: `❌ Sua presença foi **cancelada** na operação **${op.nome}**.`, ephemeral: true });
    }

    // Training buttons
    if (customId.startsWith('treino_confirmar_')) {
      const id = customId.replace('treino_confirmar_', '');
      const db = readDB('treinos');
      const treino = db[guild.id]?.[id];
      if (!treino) return interaction.reply({ content: '❌ Treino não encontrado.', ephemeral: true });

      if (treino.confirmados.includes(user.id)) {
        return interaction.reply({ content: '⚠️ Você já confirmou presença neste treino.', ephemeral: true });
      }

      treino.confirmados.push(user.id);
      writeDB('treinos', db);

      await interaction.reply({
        content: `✅ Presença confirmada no treino **${treino.nome}**! Prepare seu equipamento. 🎯`,
        ephemeral: true,
      });
    }

    if (customId.startsWith('treino_cancelar_')) {
      const id = customId.replace('treino_cancelar_', '');
      const db = readDB('treinos');
      const treino = db[guild.id]?.[id];
      if (!treino) return interaction.reply({ content: '❌ Treino não encontrado.', ephemeral: true });

      treino.confirmados = treino.confirmados.filter(uid => uid !== user.id);
      writeDB('treinos', db);

      await interaction.reply({ content: `❌ Presença **cancelada** no treino **${treino.nome}**.`, ephemeral: true });
    }
  },
};
