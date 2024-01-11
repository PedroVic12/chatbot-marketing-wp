// Get group members
await this.whatsapp.getGroupMembers('00000000-000000@g.us');

// Get group members ids
await this.whatsapp.getGroupMembersIds('00000000-000000@g.us');

// Generate group invite url link
await this.whatsapp.getGroupInviteLink('00000000-000000@g.us');

// Remove participant
await this.whatsapp.removeParticipant('00000000-000000@g.us', '111111111111@c.us');

// Add participant
await this.whatsapp.addParticipant('00000000-000000@g.us', '111111111111@c.us');

// Join a group using the group invite code
await this.whatsapp.joinGroup(InviteCode);


// Retrieve all chats
const chats = await this.whatsapp.getAllChats();

//Retrieves all chats new messages
const chatsAllNew = this.whatsapp.getAllChatsNewMsg();

//Retrieves all chats Contacts
const contacts = await this.whatsapp.getAllChatsContacts();

//Retrieve all contacts new messages
const contactNewMsg = await this.whatsapp.getChatContactNewMsg();

// Retrieve all groups
// you can pass the group id optional use, exemple: this.whatsapp.getAllChatsGroups('00000000-000000@g.us')
const getAllChatsGroups = await this.whatsapp.getAllChatsGroups();

//Retrieve all groups new messages
const groupNewMsg = await this.whatsapp.getChatGroupNewMsg();