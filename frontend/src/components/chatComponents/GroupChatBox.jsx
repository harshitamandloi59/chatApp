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
		handleScrollEnd(groupUser.current);
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
		<div className="flex -m-2 sm:-m-4 flex-col items-center my-6 text-slate-300 min-h-screen w-full fixed top-0 justify-center z-50 px-4">
			<div className="p-3 pt-4 w-full sm:w-[80%] md:w-[60%] lg:w-[50%] xl:w-[40%] min-w-72 max-w-[500px] border border-slate-400 bg-slate-800 rounded-lg h-fit max-h-[90vh] overflow-hidden transition-all relative">
				<h2 className="text-xl sm:text-2xl underline underline-offset-8 font-semibold text-slate-100 w-full text-center mb-4">
					Create a Group
				</h2>
				
				{/* Group Image Selection */}
				<div className="w-full flex justify-center mb-4">
					<div className="relative">
						<Avatar
							src={groupImage ? URL.createObjectURL(groupImage) : null}
							name={isGroupName || "Group"}
							size="w-16 h-16 sm:w-20 sm:h-20"
							className="border-2 border-slate-600"
						/>
						<button
							onClick={() => groupImageRef.current?.click()}
							className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
							title="Add group photo"
						>
							<FaCamera className="text-white text-xs sm:text-sm" />
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

				{/* Scrollable Content Area */}
				<div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto scroll-style">
					{/* Search Input */}
					<div className="w-full flex flex-nowrap items-center justify-center gap-2 px-2">
						<input
							value={inputUserName}
							id="search"
							type="text"
							placeholder="Search Users..."
							className="flex-1 border border-slate-600 py-2 px-3 font-normal outline-none rounded-md cursor-pointer bg-transparent active:bg-black/20 text-sm"
							onChange={(e) => setInputUserName(e.target?.value)}
						/>
						<label htmlFor="search" className="cursor-pointer p-2">
							<FaSearch title="Search Users" className="text-sm" />
						</label>
					</div>

					{/* Selected Users */}
					{isGroupUsers?.length > 0 && (
						<div className="px-2">
							<h3 className="text-sm font-medium mb-2 text-slate-300">Selected Users ({isGroupUsers.length})</h3>
							<div
								ref={groupUser}
								className="flex w-full gap-2 py-2 overflow-x-auto scroll-style-x"
							>
								{isGroupUsers?.map((user) => {
									return (
										<div
											key={user?._id}
											className="flex justify-center items-center gap-1 border border-slate-600 py-1.5 px-2 font-normal rounded-md cursor-pointer bg-transparent active:bg-black/20 text-nowrap text-sm min-w-fit"
										>
											<h1>{user?.firstName}</h1>
											<div
												title={`Remove ${user?.firstName}`}
												onClick={() =>
													handleRemoveGroupUser(user?._id)
												}
												className="bg-black/15 hover:bg-black/50 h-5 w-5 rounded-md flex items-center justify-center cursor-pointer ml-1"
											>
												<MdOutlineClose size={14} />
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Users List */}
					<div className="px-2">
						<h3 className="text-sm font-medium mb-2 text-slate-300">Available Users</h3>
						<div className="flex flex-col gap-1 max-h-[30vh] overflow-y-auto scroll-style">
							{selectedUsers.length == 0 && isChatLoading ? (
								<ChatShimmer />
							) : (
								<>
									{selectedUsers?.length === 0 && (
										<div className="w-full h-20 flex justify-center items-center text-white">
											<h1 className="text-sm font-semibold">
												No users found.
											</h1>
										</div>
									)}
									{selectedUsers?.map((user) => {
										return (
											<div
												key={user?._id}
												className="w-full h-14 border-slate-500 border rounded-lg flex justify-start items-center p-2 font-semibold gap-2 hover:bg-black/50 transition-all cursor-pointer text-white"
												onClick={() => {
													addGroupUser(user);
													setInputUserName("");
												}}
											>
												<Avatar
													src={
														user?.image
															? `${import.meta.env.VITE_APP_API_URL}${
																	user?.image
																}`
															: null
													}
													name={`${user?.firstName} ${user?.lastName}`}
													size="w-10 h-10"
												/>
												<div className="flex-1 min-w-0">
													<span className="line-clamp-1 capitalize text-sm">
														{user?.firstName} {user?.lastName}
													</span>
													<span className="text-xs font-light text-slate-400">
														{SimpleDateAndTime(user?.createdAt)}
													</span>
												</div>
											</div>
										);
									})}
								</>
							)}
						</div>
					</div>
				</div>

				{/* Group Name Input and Create Button */}
				<div className="w-full flex flex-col sm:flex-row gap-2 items-center justify-center mt-4 px-2">
					<input
						type="text"
						placeholder="Group Name"
						value={isGroupName}
						className="w-full sm:flex-1 border border-slate-600 py-2 px-3 font-normal outline-none rounded-md cursor-pointer bg-transparent active:bg-black/20 text-sm"
						onChange={(e) => setGroupName(e.target?.value)}
					/>
					<button
						className="w-full sm:w-auto border border-slate-600 py-2 px-4 rounded-lg bg-green-400 text-black font-semibold hover:text-white hover:bg-green-700 transition-colors text-sm"
						onClick={handleCreateGroupChat}
					>
						Create Group
					</button>
				</div>

				{/* Close Button */}
				<div
					title="Close"
					onClick={() => dispatch(setGroupChatBox())}
					className="bg-black/15 hover:bg-black/50 h-7 w-7 rounded-md flex items-center justify-center absolute top-3 right-3 cursor-pointer"
				>
					<MdOutlineClose size={22} />
				</div>
			</div>
		</div>
	);
};

export default GroupChatBox;
