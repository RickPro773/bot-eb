# 🎖️ Bot Exército Brasileiro — MilSim Discord

Bot completo para servidores MilSim do Exército Brasileiro no Discord.

---

## ⚡ Instalação Rápida

### Pré-requisitos
- [Node.js v18+](https://nodejs.org/)

### Passos

1. **Extraia a pasta** `eb-bot` para onde quiser no PC

2. **Instale as dependências:**
```bash
cd eb-bot
npm install
```

3. **Registre os slash commands** (faça isso UMA VEZ antes de iniciar):
```bash
npm run deploy
```
> ⚠️ Aguarde até ~1 hora para os comandos aparecerem globalmente no Discord.

4. **Inicie o bot:**
```bash
npm start
```

---

## 📋 Comandos Disponíveis

### 📢 Avisos
| Comando | Descrição |
|---------|-----------|
| `/aviso` | Emite aviso oficial com tipos: Urgente 🚨, Operação ⚔️, Treino 🎯, Reunião 📋, Formatura 🫡, Geral 📢 |

### ⚔️ Militar
| Comando | Descrição |
|---------|-----------|
| `/operacao criar` | Cria operação militar com briefing e botão de confirmação de presença |
| `/operacao listar` | Lista operações ativas |
| `/operacao encerrar` | Encerra uma operação pelo ID |
| `/treino agendar` | Agenda treino (Combate, Físico, Tática, Condução, Primeiros Socorros, Comunicações) |
| `/treino listar` | Lista treinos agendados |
| `/posto promover` | Promove membro a um posto militar |
| `/posto ver` | Vê ficha militar de um membro |
| `/posto lista` | Lista hierarquia completa (Recruta → General de Exército) |

### ⚖️ Moderação
| Comando | Descrição |
|---------|-----------|
| `/punicao aplicar` | Aplica punição: advertência verbal/escrita, repreensão, mute, kick ou ban |
| `/punicao historico` | Exibe histórico de punições de um membro |

### ⚙️ Administração
| Comando | Descrição |
|---------|-----------|
| `/config boas-vindas` | Define canal de boas-vindas automático |
| `/config cargo-recruta` | Define cargo automático para novos membros |
| `/config log` | Define canal de logs |
| `/config ver` | Mostra configurações atuais |

### ℹ️ Info
| Comando | Descrição |
|---------|-----------|
| `/ajuda` | Mostra todos os comandos |

---

## 🗂️ Estrutura de Arquivos

```
eb-bot/
├── index.js              # Arquivo principal
├── deploy-commands.js    # Registro de slash commands
├── .env                  # Token e configurações
├── commands/
│   ├── avisos/           # /aviso
│   ├── militar/          # /operacao, /treino, /posto
│   ├── moderacao/        # /punicao
│   ├── admin/            # /config
│   └── info/             # /ajuda
├── events/               # Eventos do Discord
├── utils/                # Utilitários (DB, Embeds)
└── data/                 # Dados em JSON (gerado automaticamente)
```

---

## 🏷️ Hierarquia Militar Completa

Do menor ao maior posto:

1. 🪖 Recruta (REC)
2. 🎽 Soldado (SD)
3. 🪖 Cabo (CB)
4. ⭐ 3º Sargento
5. ⭐⭐ 2º Sargento
6. ⭐⭐⭐ 1º Sargento
7. 🔰 Subtenente (ST)
8. 🔱 2º Tenente
9. 🔱🔱 1º Tenente
10. 🎖️ Capitão (CAP)
11. 🎖️🎖️ Major (MAJ)
12. 🏅 Tenente-Coronel (TC)
13. 🏅🏅 Coronel (CEL)
14. ⭐ General de Brigada
15. ⭐⭐ General de Divisão
16. ⭐⭐⭐ General de Exército

---

## ⚠️ Permissões Necessárias no Discord

O bot precisa das seguintes permissões no servidor:
- Gerenciar Cargos
- Gerenciar Mensagens
- Banir/Expulsar Membros
- Timeout de Membros
- Ler/Enviar Mensagens

**Ordem, Disciplina e Patriotismo! 🇧🇷**
