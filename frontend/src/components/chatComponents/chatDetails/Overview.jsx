import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import getChatName, { getChatImage, getChatUserName } from "../../../utils/getChatName";
import { SimpleDateAndTime } from "../../../utils/formateDateTime";
import { CiCircleInfo } from "react-icons/ci";
import { FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";
import { RxUpdate } from "react-icons/rx";
import { addSelectedChat } from "../../../redux/slices/myChatSlice";
import { setLoading } from "../../../redux/slices/conditionSlice";
import Avatar from "../../common/Avatar";

const Overview = () => {
	const dispatch = useDispatch();
	const groupImageRef = useRef();
	const authUserId = useSelector((store) => store?.auth?._id);
	const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
	const [changeNameBox, setChangeNameBox] = useState(false);
	const [changeName, setChangeName] = useState(selectedChat?.chatName);
	const handleShowNameChange = () => {
		if (authUserId === selectedChat?.groupAdmin?._id) {
			setChangeNameBox(!changeNameBox);
			setChangeName(selectedChat?.chatName);
		} else {
			toast.warn("You're not admin");
		}
	};
	const handleChangeName = () => {
		setChangeNameBox(false);
		if (selectedChat?.chatName === changeName.trim()) {
			toast.warn("Name already taken");
			return;
		} else if (!changeName.trim()) {
			toast.warn("Please enter group name");
			return;
		}
		dispatch(setLoading(true));
		const token = localStorage.getItem("token");
		fetch(`${import.meta.env.VITE_APP_API_URL}/api/chat/rename`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				name: changeName.trim(),
				chatId: selectedChat?._id,
			}),
		})
			.then((res) => res.json())
			.then((json) => {
				dispatch(addSelectedChat(json?.data));
				dispatch(setLoading(false));
				toast.success("Group name changed");
			})
			.catch((err) => {
				toast.error(err.message);
				dispatch(setLoading(false));
			});
	};

	const handleGroupImageSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Check if user is admin
			if (authUserId !== selectedChat?.groupAdmin?._id) {
				toast.warn("You're not admin");
				return;
			}

			// Check file type
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
			
			if (!allowedTypes.includes(file.type)) {
				toast.error("Only images (JPEG, PNG, GIF, WEBP) are allowed!");
				return;
			}

			// Check file size (5MB limit)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Image size must be less than 5MB!");
				return;
			}

			// Upload group image
			updateGroupImage(file);
		}
	};

	const updateGroupImage = async (imageFile) => {
		dispatch(setLoading(true));
		const token = localStorage.getItem("token");
		const formData = new FormData();
		
		formData.append("chatId", selectedChat?._id);
		formData.append("groupImage", imageFile);

		try {
			const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/chat/updateGroupImage`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			const json = await response.json();
			
			if (response.ok) {
				dispatch(addSelectedChat(json?.data));
				toast.success("Group image updated successfully!");
			} else {
				throw new Error(json.message || "Failed to update group image");
			}
		} catch (err) {
			toast.error(err.message || "Failed to update group image");
		} finally {
			dispatch(setLoading(false));
		}
	};

	return (
		<div className="flex flex-col gap-2 text-white p-4">
			<div className="flex flex-col items-center justify-center gap-2 mb-3 mt-3">
				<div className="relative">
					<Avatar
						src={getChatImage(selectedChat, authUserId)}
						name={getChatUserName(selectedChat, authUserId)}
						size="w-16 h-16"
					/>
					{selectedChat?.isGroupChat && authUserId === selectedChat?.groupAdmin?._id && (
						<button
							onClick={() => groupImageRef.current?.click()}
							className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
							title="Change group photo"
						>
							<FaCamera className="text-white text-xs" />
						</button>
					)}
					<input
						ref={groupImageRef}
						type="file"
						accept="image/*"
						onChange={handleGroupImageSelect}
						className="hidden"
					/>
				</div>
				<div className="text-center leading-5 font-semibold text-lg flex items-center gap-1">
					<h1>{getChatName(selectedChat, authUserId)}</h1>
					{selectedChat?.isGroupChat && (
						<CiCircleInfo
							fontSize={15}
							title="Change Name"
							className="cursor-pointer"
							onClick={handleShowNameChange}
						/>
					)}
				</div>
			</div>
			{changeNameBox && (
				<>
					<h1>Rename Group Chat :</h1>
					<div className="flex gap-1">
						<input
							type="text"
							className="w-full border border-slate-600 py-1 px-2 font-normal outline-none rounded-md cursor-pointer bg-transparent active:bg-black/20"
							value={changeName}
							onChange={(e) => setChangeName(e.target.value)}
						/>
						<div
							title="Change Name"
							className="border border-slate-600 p-2 w-fit font-normal outline-none rounded-md cursor-pointer bg-transparent active:bg-black/20"
							onClick={handleChangeName}
						>
							<RxUpdate fontSize={18} />
						</div>
					</div>
				</>
			)}
			<div className="min-h-0.5 w-full bg-slate-900/50"></div>
			<div className="text-sm mt-1">
				<h1>Created</h1>
				<h2 className="opacity-50">
					{SimpleDateAndTime(selectedChat?.createdAt)}
				</h2>
			</div>
			<div className="text-sm">
				<h1>Last Updated</h1>
				<h2 className="opacity-50">
					{SimpleDateAndTime(selectedChat?.updatedAt)}
				</h2>
			</div>
			<div className="text-sm">
				<h1>Last Message</h1>
				<h2 className="opacity-50">
					{SimpleDateAndTime(selectedChat?.latestMessage?.updatedAt)}
				</h2>
			</div>
		</div>
	);
};

export default Overview;
