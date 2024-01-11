// Get group members
await client.getGroupMembers('00000000-000000@g.us');

// Get group members ids
await client.getGroupMembersIds('00000000-000000@g.us');

// Generate group invite url link
await client.getGroupInviteLink('00000000-000000@g.us');

// Remove participant
await client.removeParticipant('00000000-000000@g.us', '111111111111@c.us');

// Add participant
await client.addParticipant('00000000-000000@g.us', '111111111111@c.us');

// Join a group using the group invite code
await client.joinGroup(InviteCode);


// Retrieve all chats
const chats = await client.getAllChats();

//Retrieves all chats new messages
const chatsAllNew = getAllChatsNewMsg();

//Retrieves all chats Contacts
const contacts = await client.getAllChatsContacts();

//Retrieve all contacts new messages
const contactNewMsg = await client.getChatContactNewMsg();

// Retrieve all groups
// you can pass the group id optional use, exemple: client.getAllChatsGroups('00000000-000000@g.us')
const getAllChatsGroups = await client.getAllChatsGroups();

//Retrieve all groups new messages
const groupNewMsg = await client.getChatGroupNewMsg();