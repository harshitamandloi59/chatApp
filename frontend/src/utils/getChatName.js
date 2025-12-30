import GroupLogo from "../assets/group.png";

const getChatName = (chat, authUserId) => {
	const chatName =
		chat?.chatName == "Messenger"
			? authUserId == chat.users[0]._id
				? chat.users[1].firstName + " " + chat.users[1].lastName
				: chat.users[0].firstName + " " + chat.users[0].lastName
			: chat?.chatName;
	return chatName;
};

export const getChatImage = (chat, authUserId) => {
	// For group chats, return group logo
	if (chat?.chatName !== "Messenger") {
		return GroupLogo;
	}
	
	// For individual chats, return the other user's image with backend URL
	const otherUser = authUserId == chat.users[0]._id ? chat.users[1] : chat.users[0];
	return otherUser.image ? `${import.meta.env.VITE_BACKEND_URL}${otherUser.image}` : null;
};

export const getChatUserName = (chat, authUserId) => {
	if (chat?.chatName !== "Messenger") {
		return chat?.chatName;
	}
	
	const otherUser = authUserId == chat.users[0]._id ? chat.users[1] : chat.users[0];
	return `${otherUser.firstName} ${otherUser.lastName}`;
};

export default getChatName;
