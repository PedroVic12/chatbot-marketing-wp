const venom = require('venom-bot');
const wppconnect = require('@wppconnect-team/wppconnect');


class GroundonController {
	constructor() {
		this.whatsapp = null;
		this.timeoutDuration = 45000; // Tempo limite em milissegundos (45000 ms = 45 s)
		this.timeoutID = null; // Armazena o ID do tempo limite para que possamos cancelá-lo posteriormente
	}

	conectarWpp() {
		return new Promise(async (resolve, reject) => {
			try {
				this.whatsapp = await wppconnect.create({
					tokenStore: 'file',
					folderNameToken: 'tokens',
					session: 'marketing-bot' //! nome da sessão
				});

				if (this.whatsapp) {
					console.log('\nConectado ao WhatsApp com sucesso!');
					resolve(true);
				} else {
					console.log(`Debug ${this.whatsapp}`);
					reject(new Error("WhatsApp connection failed."));
				}
			} catch (error) {
				console.error('\n\nErro ao conectar ao WhatsApp:', error);
				reject(error);
			}
		});
	}


	receberMensagemConsole() {
		if (this.whatsapp) {
			this.whatsapp.onMessage((message) => {
				console.log(`Mensagem recebida: ${message.body}`);
				this.groundon.armazenarConversa(message);

				this.resetTimeout(); // Reinicie o tempo limite cada vez que recebermos uma mensagem
			});
		} else {
			console.error('WhatsApp client not connected.');
		}
	}


	async restartChatbot() {

		await this.whatsapp.restartService()
		await this.conectarWpp()
	}


	// Método auxiliar para adicionar atraso (em milissegundos)
	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}






	//! Restante do código da classe GroundonController
	async handleMessage(message) {
		// Verifica se o usuário já está online
		if (!this.onlineUsers.has(message.sender.id)) {
			this.onlineUsers.add(message.sender.id);
			console.log(`Novo usuário online: ${message.sender.id}`);
		}

		// Lógica para processar a mensagem recebida
		console.log(`Mensagem recebida de ${message.sender.id}: ${message.body}`);

		// Realize as ações necessárias com base na mensagem


		// Exemplo: Contar o número de usuários online
		const onlineUserCount = this.onlineUsers.size;
		console.log(`Número de usuários online: ${onlineUserCount}`);
	}







     
    // Get group members
    async getGroupMembers(groupId) {
        try {
          const members = await this.whatsapp.getGroupMembers(groupId);
          return members;
        } catch (error) {
          console.error('Error getting group members:', error);
          return []; // Return an empty array on error
        }
      }
    
      // Get group members IDs
      async getGroupMembersIds(groupId) {
        try {
          const memberIds = await this.whatsapp.getGroupMembersIds(groupId);
          return memberIds;
        } catch (error) {
          console.error('Error getting group members IDs:', error);
          return []; // Return an empty array on error
        }
      }
    
      // Generate group invite url link
      async getGroupInviteLink(groupId) {
        try {
          const inviteLink = await this.whatsapp.getGroupInviteLink(groupId);
          return inviteLink;
        } catch (error) {
          console.error('Error getting group invite link:', error);
          return null; // Return null on error
        }
      }
    
      // Remove participant
      async removeParticipant(groupId, participantId) {
        try {
          await this.whatsapp.removeParticipant(groupId, participantId);
          return true; // Indicate success
        } catch (error) {
          console.error('Error removing participant:', error);
          return false; // Indicate failure
        }
      }
    
      // Add participant
      async addParticipant(groupId, participantId) {
        try {
          await this.whatsapp.addParticipant(groupId, participantId);
          return true; // Indicate success
        } catch (error) {
          console.error('Error adding participant:', error);
          return false; // Indicate failure
        }
      }
    
      // Join a group using the group invite code
      async joinGroup(inviteCode) {
        try {
          await this.whatsapp.joinGroup(inviteCode);
          return true; // Indicate success
        } catch (error) {
          console.error('Error joining group:', error);
          return false; // Indicate failure
        }
      }
    
      // Retrieve all chats
      async getAllChats() {
        try {
          const chats = await this.whatsapp.getAllChats();
          return chats;
        } catch (error) {
          console.error('Error retrieving all chats:', error);
          return []; // Return an empty array on error
        }
      }
    
      // Retrieve all chats with new messages
      async getAllChatsNewMsg() {
        try {
          const chats = await this.whatsapp.getAllChatsNewMsg();
          return chats;
        } catch (error) {
          console.error('Error retrieving all chats with new messages:', error);
          return []; // Return an empty array on error
        }
      }
    
      // Retrieve all contacts
      async getAllContacts() {
        try {
          const contacts = await this.whatsapp.getAllContacts();
          return contacts;
        } catch (error) {
          console.error('Error retrieving all contacts:', error);
          return []; // Return an empty array on error
        }
      }
    
      // Retrieve all contacts with new messages
      async getAllContactsNewMsg() {
        try {
          const contacts = await this.whatsapp.getAllContactsNewMsg();
          return contacts;
        } catch (error) {
          console.error('Error retrieving all contacts with new messages:', error);
          return []; // Return an empty array on error
        }
      }
    
      // Retrieve all groups
      async getAllGroups() {
        try {
          const groups = await this.whatsapp.getAllGroups();
          return groups;
        } catch (error) {
          console.error('Error retrieving all groups:', error);
          return []; // Return an empty array on error
        }
      }

}





module.exports = GroundonController;

function groundon_controller_main() {
	const groundonController = new GroundonController();
	groundonController.conectarWpp();
	groundonController.receberMensagemConsole();
}

//groundon_controller_main();