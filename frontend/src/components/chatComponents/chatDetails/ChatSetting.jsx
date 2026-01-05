import React, { useState } from "react";
import { CiCircleInfo } from "react-icons/ci";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { VscError } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
	setChatDetailsBox,
	setLoading,
} from "../../../redux/slices/conditionSlice";
import { addAllMessages } from "../../../redux/slices/messageSlice";
// import { deleteSelectedChat } from "../../redux/slices/myChatSlice";
import { deleteSelectedChat } from "../../../redux/slices/myChatSlice";
import socket from "../../../socket/socket";
import { API_BASE_URL } from "../../../config/api";

const ChatSetting = () => {
	const dispatch = useDispatch();
	const authUserId = useSelector((store) => store?.auth?._id);
	const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
	const [isConfirm, setConfirm] = useState("");
	const handleClearChat = () => {
		if (
			authUserId === selectedChat?.groupAdmin?._id ||
			!selectedChat?.isGroupChat
		) {
			setConfirm("clear-chat");
		} else {
			toast.warn("You're not admin");
		}
	};
	const handleDeleteGroup = () => {
		if (authUserId === selectedChat?.groupAdmin?._id) {
			setConfirm("delete-group");
		} else {
			toast.warn("You're not admin");
		}
	};
	const handleDeleteChat = () => {
		if (!selectedChat?.isGroupChat) {
			setConfirm("delete-chat");
		}
	};

	//  handle Clear Chat Call
	const handleClearChatCall = () => {
		
		dispatch(setLoading(true));
		setConfirm("");
		
		const token = localStorage.getItem("token");
		const backendUrl = import.meta.env.VITE_APP_API_URL || API_BASE_URL;
		const url = `${backendUrl}/api/message/clearChat/${selectedChat?._id}`;
		
		
		fetch(url, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		})
			.then((res) => {
				return res.json();
			})
			.then((json) => {
				dispatch(setLoading(false));
				
				if (json?.message === "success") {
					dispatch(addAllMessages([]));
					socket.emit("clear chat", selectedChat._id);
					toast.success("Cleared all messages");
				} else if (json?.error === "Invaild Route") {
					toast.error("Clear chat feature not available on live server. Please redeploy backend.");
				} else {
					toast.error(json?.message || "Failed to clear chat");
				}
			})
			.catch((err) => {
				dispatch(setLoading(false));
				toast.error("Failed to clear chat");
			});
	};
	// handle Delete Chat Call
	const handleDeleteChatCall = () => {
		
		dispatch(setLoading(true));
		setConfirm("");
		
		const token = localStorage.getItem("token");
		const backendUrl = import.meta.env.VITE_APP_API_URL || API_BASE_URL;
		// Always use deleteGroup endpoint (works for both individual and group chats)
		const url = `${backendUrl}/api/chat/deleteGroup/${selectedChat?._id}`;
		
		
		fetch(url, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		})
			.then((res) => {
				return res.json();
			})
			.then((json) => {
				dispatch(setLoading(false));
				
				if (json?.message === "success") {
					let chat = selectedChat;
					dispatch(setChatDetailsBox(false));
					dispatch(addAllMessages([]));
					dispatch(deleteSelectedChat(chat._id));
					socket.emit("delete chat", chat, authUserId);
					toast.success("Chat deleted successfully");
				} else if (json?.error === "Invaild Route") {
					toast.error("Delete chat feature not available on live server. Please redeploy backend.");
				} else {
					toast.error(json?.message || "Failed to delete chat");
				}
			})
			.catch((err) => {
				dispatch(setLoading(false));
				toast.error("Failed to delete chat");
			});
	};

	return (
		<div className="flex flex-col p-2 gap-2 text-white relative h-full z-10 overflow-auto scroll-style">
			<h1 className="font-semibold text-lg w-full text-center my-2">
				Setting
			</h1>
			<div
				onClick={handleClearChat}
				className="w-full h-8 border-slate-500 border text-sm rounded-lg flex justify-between items-center p-2 font-normal gap-2 transition-all cursor-pointer text-white"
			>
				<h1>Clear Chat</h1>
				<CiCircleInfo
					fontSize={15}
					title={
						selectedChat?.isGroupChat
							? "Admin access only"
							: "Clear Chat"
					}
					className="cursor-pointer"
				/>
			</div>
			{selectedChat?.isGroupChat ? (
				<div
					onClick={handleDeleteGroup}
					className="w-full h-8 border-slate-500 border text-sm rounded-lg flex justify-between items-center p-2 font-normal gap-2 transition-all cursor-pointer text-white"
				>
					<h1>Delete Group</h1>
					<CiCircleInfo
						fontSize={15}
						title="Admin access only"
						className="cursor-pointer"
					/>
				</div>
			) : (
				<div
					onClick={handleDeleteChat}
					className="w-full h-8 border-slate-500 border text-sm rounded-lg flex justify-between items-center p-2 font-normal gap-2 transition-all cursor-pointer text-white"
				>
					<h1>Delete Chat</h1>
					<CiCircleInfo
						fontSize={15}
						title="Delete Chat"
						className="cursor-pointer"
					/>
				</div>
			)}
			{isConfirm && (
				<div className="px-2 w-full fixed bottom-1 right-0">
					<div
						className={`w-full h-12 border-slate-500 ${
							isConfirm === "clear-chat"
								? "bg-blue-950"
								: "bg-red-950"
						}  border rounded-lg flex justify-between items-center p-2 font-semibold gap-2 transition-all cursor-pointer text-white `}
					>
						<h1>
							{isConfirm === "clear-chat"
								? "Clear chat confirmation?"
								: isConfirm === "delete-group"
								? "Delete group confirmation?"
								: "Delete chat confirmation"}
						</h1>
						<div className="flex gap-1">
							<div
								onClick={() => {
									setConfirm("");
								}}
								className="border border-slate-600 p-1.5 w-fit font-normal outline-none rounded-md cursor-pointer bg-transparent active:bg-black/20"
							>
								<VscError fontSize={19} />
							</div>
							<div
								onClick={
									isConfirm === "clear-chat"
										? handleClearChatCall
										: handleDeleteChatCall
								}
								className="border border-slate-600 p-1.5 w-fit font-normal outline-none rounded-md cursor-pointer bg-transparent active:bg-black/20"
							>
								<IoCheckmarkCircleOutline fontSize={19} />
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChatSetting;
