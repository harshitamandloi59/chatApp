import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	setChatLoading,
	setGroupChatBox,
	setGroupChatId,
	setLoading,
} from "../../redux/slices/conditionSlice";
import { MdOutlineClose } from "react-icons/md";
import { FaSearch, FaCamera } from "react-icons/fa";
import ChatShimmer from "../loading/ChatShimmer";
import { handleScrollEnd } from "../../utils/handleScrollTop";
import { toast } from "react-toastify";
import { addSelectedChat } from "../../redux/slices/myChatSlice";
import { SimpleDateAndTime } from "../../utils/formateDateTime";
import socket from "../../socket/socket";
import Avatar from "../common/Avatar";

const GroupChatBox = () => {
	const groupUser = useRef("");
	const groupImageRef = useRef("");
	const dispatch = useDispatch();
	const isChatLoading = useSelector(
		(store) => store?.condition?.isChatLoading
	);
	const authUserId = useSelector((store) => store?.auth?._id);
	const [isGroupName, setGroupName] = useState(""); // input text
	const [groupImage, setGroupImage] = useState(null); // group profile image
	const [users, setUsers] = useState([]); // all users
	const [inputUserName, setInputUserName] = useState(""); // input text
	const [selectedUsers, setSelectedUsers] = useState([]); // user search results
	const [isGroupUsers, setGroupUsers] = useState([]); // group user results
	// All Users Api Call
	useEffect(() => {
		const getAllUsers = () => {
			dispatch(setChatLoading(true));
			const token = localStorage.getItem("token");
			fetch(`${import.meta.env.VITE_APP_API_URL}/api/user/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          setUsers(json.data || []);
          setSelectedUsers(json.data || []);
          dispatch(setChatLoading(false));
        })
        .catch((err) => {
          dispatch(setChatLoading(false));
        });
		};
		getAllUsers();
	}, []);
	useEffect(() => {
		setSelectedUsers(
			users.filter((user) => {
				return (
					user.firstName
						.toLowerCase()
						.includes(inputUserName?.toLowerCase()) ||
					user.lastName
						.toLowerCase()
						.includes(inputUserName?.toLowerCase()) ||
					user.email
						.toLowerCase()
						.includes(inputUserName?.toLowerCase())
				);
			})
		);
	}, [inputUserName]);

	useEffect(() => {
		if (groupUser.current) {
			handleScrollEnd(groupUser.current);
		}
	}, [isGroupUsers]);

	const addGroupUser = (user) => {
		const existUsers = isGroupUsers.find(
			(currUser) => currUser?._id == user?._id
		);
		if (!existUsers) {
			setGroupUsers([...isGroupUsers, user]);
		} else {
			toast.warn('"' + user?.firstName + '" already Added');
		}
	};

	const handleRemoveGroupUser = (removeUserId) => {
		setGroupUsers(
			isGroupUsers.filter((user) => {
				return user?._id !== removeUserId;
			})
		);
	};

	const handleGroupImageSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
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

			setGroupImage(file);
			toast.success("Group image selected!");
		}
	};

	const handleCreateGroupChat = async () => {
		if (isGroupUsers.length < 2) {
			toast.warn("Please select atleast 2 users");
			return;
		} else if (!isGroupName.trim()) {
			toast.warn("Please enter group name");
			return;
		}
		dispatch(setGroupChatBox());
		dispatch(setLoading(true));
		
		const token = localStorage.getItem("token");
		const formData = new FormData();
		
		formData.append("name", isGroupName.trim());
		formData.append("users", JSON.stringify(isGroupUsers));
		
		if (groupImage) {
			formData.append("groupImage", groupImage);
		}

		try {
			const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/chat/group`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

			const json = await response.json();
			
			if (response.ok) {
				dispatch(addSelectedChat(json?.data));
				dispatch(setGroupChatId(json?.data?._id));
				dispatch(setLoading(false));
				socket.emit("chat created", json?.data, authUserId);
				toast.success("Group created successfully!");
			} else {
				throw new Error(json.message || "Failed to create group");
			}
		} catch (err) {
			toast.error(err.message || "Failed to create group");
			dispatch(setLoading(false));
		}
	};
	return (
		<div className="flex flex-col items-center text-slate-300 min-h-screen w-full fixed top-0 justify-start z-50 px-2 py-2 overflow-hidden">
			<div className="w-full max-w-[400px] border border-slate-400 bg-slate-800 rounded-lg h-[95vh] flex flex-col transition-all relative mt-2">
				
				{/* Header - Fixed */}
				<div className="p-3 border-b border-slate-600 flex-shrink-0">
					<h2 className="text-lg font-semibold text-slate-100 w-full text-center">
						Create a Group
					</h2>
					
					{/* Close Button */}
					<div
						title="Close"
						onClick={() => dispatch(setGroupChatBox())}
						className="bg-black/15 hover:bg-black/50 h-6 w-6 rounded-md flex items-center justify-center absolute top-2 right-2 cursor-pointer"
					>
						<MdOutlineClose size={16} />
					</div>
				</div>

				{/* Group Image - Fixed */}
				<div className="p-3 flex justify-center border-b border-slate-600 flex-shrink-0">
					<div className="relative">
						<Avatar
							src={groupImage ? URL.createObjectURL(groupImage) : null}
							name={isGroupName || "Group"}
							size="w-14 h-14"
							className="border-2 border-slate-600"
						/>
						<button
							onClick={() => groupImageRef.current?.click()}
							className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
							title="Add group photo"
						>
							<FaCamera className="text-white text-xs" />
						</button>
						<input
							ref={groupImageRef}
							type="file"
							accept="image/*"
							onChange={handleGroupImageSelect}
							className="hidden"
						/>
					</div>
				</div>

				{/* Scrollable Content Area - Flexible */}
				<div className="flex-1 overflow-y-auto scroll-style p-3 space-y-3 min-h-0">
					{/* Search Input */}
					<div className="flex items-center gap-2">
						<input
							value={inputUserName}
							id="search"
							type="text"
							placeholder="Search Users..."
							className="flex-1 border border-slate-600 py-2 px-2 font-normal outline-none rounded-md bg-transparent text-sm"
							onChange={(e) => setInputUserName(e.target?.value)}
						/>
						<label htmlFor="search" className="cursor-pointer p-1">
							<FaSearch className="text-sm" />
						</label>
					</div>

					{/* Selected Users */}
					{isGroupUsers?.length > 0 && (
						<div>
							<h3 className="text-xs font-medium mb-1 text-slate-300">
								Selected ({isGroupUsers.length})
							</h3>
							<div
								ref={groupUser}
								className="flex gap-1 overflow-x-auto scroll-style-x pb-1"
							>
								{isGroupUsers?.map((user) => {
									return (
										<div
											key={user?._id}
											className="flex items-center gap-1 border border-slate-600 py-1 px-2 rounded-md bg-transparent text-nowrap text-xs min-w-fit"
										>
											<span>{user?.firstName}</span>
											<button
												title={`Remove ${user?.firstName}`}
												onClick={() =>
													handleRemoveGroupUser(user?._id)
												}
												className="bg-black/15 hover:bg-black/50 h-3 w-3 rounded-md flex items-center justify-center ml-1"
											>
												<MdOutlineClose size={10} />
											</button>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Users List */}
					<div className="flex-1 min-h-0">
						<h3 className="text-xs font-medium mb-1 text-slate-300">Available Users</h3>
						<div className="space-y-1 overflow-y-auto scroll-style" style={{maxHeight: 'calc(100% - 20px)'}}>
							{selectedUsers.length == 0 && isChatLoading ? (
								<ChatShimmer />
							) : (
								<>
									{selectedUsers?.length === 0 && (
										<div className="text-center py-2 text-slate-400">
											<p className="text-xs">No users found.</p>
										</div>
									)}
									{selectedUsers?.map((user) => {
										return (
											<div
												key={user?._id}
												className="flex items-center gap-2 p-2 border border-slate-500 rounded-lg hover:bg-black/30 transition-all cursor-pointer"
												onClick={() => {
													addGroupUser(user);
													setInputUserName("");
												}}
											>
												<Avatar
													src={
														user?.image
															? `${import.meta.env.VITE_APP_API_URL}${user?.image}`
															: null
													}
													name={`${user?.firstName} ${user?.lastName}`}
													size="w-8 h-8"
												/>
												<div className="flex-1 min-w-0">
													<p className="text-xs font-medium text-white truncate">
														{user?.firstName} {user?.lastName}
													</p>
													<p className="text-xs text-slate-400 truncate">
														{user?.email}
													</p>
												</div>
											</div>
										);
									})}
								</>
							)}
						</div>
					</div>
				</div>

				{/* Footer - Fixed (Group Name + Create Button) */}
				<div className="p-3 border-t border-slate-600 space-y-2 flex-shrink-0 bg-slate-800">
					<input
						type="text"
						placeholder="Enter Group Name"
						value={isGroupName}
						className="w-full border border-slate-600 py-2 px-2 font-normal outline-none rounded-md bg-transparent text-sm"
						onChange={(e) => setGroupName(e.target?.value)}
					/>
					<button
						className="w-full py-2 px-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={handleCreateGroupChat}
						disabled={!isGroupName.trim() || isGroupUsers.length < 2}
					>
						Create Group ({isGroupUsers.length})
					</button>
					{isGroupUsers.length < 2 && (
						<p className="text-xs text-red-400 text-center">
							Select at least 2 users
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default GroupChatBox;
