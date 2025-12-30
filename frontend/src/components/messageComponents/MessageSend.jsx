// import React, { useEffect, useRef, useState } from "react";
// import { FaFolderOpen, FaPaperPlane } from "react-icons/fa";
// import { MdOutlineClose } from "react-icons/md";
// import { useDispatch, useSelector } from "react-redux";
// import { setSendLoading, setTyping } from "../../redux/slices/conditionSlice";
// import {
// 	addNewMessage,
// 	addNewMessageId,
// } from "../../redux/slices/messageSlice";
// import { LuLoader } from "react-icons/lu";
// import { toast } from "react-toastify";
// import socket from "../../socket/socket";

// let lastTypingTime;
// const MessageSend = ({ chatId }) => {
// 	const mediaFile = useRef();
// 	// const [mediaBox, setMediaBox] = useState(false);
// 	// const [mediaURL, setMediaURL] = useState("");
// 	const [newMessage, setMessage] = useState("");
// 	const dispatch = useDispatch();
// 	const isSendLoading = useSelector(
// 		(store) => store?.condition?.isSendLoading
// 	);
// 	const isSocketConnected = useSelector(
// 		(store) => store?.condition?.isSocketConnected
// 	);
// 	const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
// 	const isTyping = useSelector((store) => store?.condition?.isTyping);

// 	useEffect(() => {
// 		socket.on("typing", () => dispatch(setTyping(true)));
// 		socket.on("stop typing", () => dispatch(setTyping(false)));
// 	}, []);

// 	// Media Box Control
// 	const handleMediaBox = () => {
// 		if (mediaFile.current?.files[0]) {
// 			// const file = mediaFile.current.files[0];
// 			// const url = URL.createObjectURL(file);
// 			// setMediaURL(url);
// 			// setMediaBox(true);
// 			toast.warn("Comming soon...");
// 		} else {
// 			// setMediaBox(false);
// 		}
// 	};

// 	// Media Box Hidden && Input file remove
// 	// const clearMediaFile = () => {
// 	//     mediaFile.current.value = "";
// 	//     setMediaURL("");
// 	//     setMediaBox(false);
// 	// };

// 	// Send Message Api call
// 	const handleSendMessage = async () => {
// 		if (newMessage?.trim()) {
// 			const message = newMessage?.trim();
// 			setMessage("");
// 			socket.emit("stop typing", selectedChat._id);
// 			dispatch(setSendLoading(true));
// 			const token = localStorage.getItem("token");
// 			fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message`, {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 					Authorization: `Bearer ${token}`,
// 				},
// 				body: JSON.stringify({
// 					message: message,
// 					chatId: chatId,
// 				}),
// 			})
// 				.then((res) => res.json())
// 				.then((json) => {
// 					dispatch(addNewMessageId(json?.data?._id));
// 					dispatch(addNewMessage(json?.data));
// 					socket.emit("new message", json.data);
// 					dispatch(setSendLoading(false));
// 				})
// 				.catch((err) => {
// 					console.log(err);
// 					dispatch(setSendLoading(false));
// 					toast.error("Message Sending Failed");
// 				});
// 		}
// 	};

// 	const handleTyping = (e) => {
// 		setMessage(e.target?.value);
// 		if (!isSocketConnected) return;
// 		if (!isTyping) {
// 			socket.emit("typing", selectedChat._id);
// 		}
// 		lastTypingTime = new Date().getTime();
// 		let timerLength = 3000;
// 		let stopTyping = setTimeout(() => {
// 			let timeNow = new Date().getTime();
// 			let timeDiff = timeNow - lastTypingTime;
// 			if (timeDiff > timerLength) {
// 				socket.emit("stop typing", selectedChat._id);
// 			}
// 		}, timerLength);
// 		return () => clearTimeout(stopTyping);
// 	};

// 	return (
// 		<>
// 			{/* {mediaBox && (
//                 <div className="border-slate-500 border rounded-md absolute bottom-[7vh] mb-1 left-2 bg-slate-800 w-60 h-48 ">
//                     <img
//                         src={mediaURL}
//                         alt="media"
//                         className="h-full w-full object-contain"
//                     />
//                     <MdOutlineClose
//                         title="Delete"
//                         size={25}
//                         className="absolute top-2 right-3 cursor-pointer text-white bg-slate-800 rounded-xl p-1"
//                         onClick={clearMediaFile}
//                     />
//                 </div>
//             )} */}
// 			<form
// 				className="w-full flex items-center gap-1 h-[7vh] p-3 bg-slate-800 text-white"
// 				onSubmit={(e) => e.preventDefault()}
// 			>
// 				<label htmlFor="media" className="cursor-pointer">
// 					<FaFolderOpen
// 						title="Open File"
// 						size={22}
// 						className="active:scale-75 hover:text-green-400"
// 					/>
// 				</label>
// 				<input
// 					ref={mediaFile}
// 					type="file"
// 					name="image"
// 					accept="image/png, image/jpg, image/gif, image/jpeg"
// 					id="media"
// 					className="hidden"
// 					onChange={handleMediaBox}
// 				/>
// 				<input
// 					type="text"
// 					className="outline-none p-2 w-full bg-transparent"
// 					placeholder="Type a message"
// 					value={newMessage}
// 					onChange={(e) => handleTyping(e)}
// 				/>
// 				<span className="flex justify-center items-center">
// 					{newMessage?.trim() && !isSendLoading && (
// 						<button
// 							className="outline-none p-2 border-slate-500 border-l"
// 							onClick={handleSendMessage}
// 						>
// 							<FaPaperPlane
// 								title="Send"
// 								size={18}
// 								className="active:scale-75 hover:text-green-400"
// 							/>
// 						</button>
// 					)}
// 					{isSendLoading && (
// 						<button className="outline-none p-2 border-slate-500 border-l">
// 							<LuLoader
// 								title="loading..."
// 								fontSize={18}
// 								className="animate-spin"
// 							/>
// 						</button>
// 					)}
// 				</span>
// 			</form>
// 		</>
// 	);
// };

// export default MessageSend;


import { useEffect, useRef, useState } from "react";
import { FaFolderOpen, FaPaperPlane, FaImage, FaFilePdf, FaFile } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setSendLoading, setTyping } from "../../redux/slices/conditionSlice";
import {
  addNewMessage,
  addNewMessageId,
} from "../../redux/slices/messageSlice";
import { LuLoader } from "react-icons/lu";
import { toast } from "react-toastify";
import socket from "../../socket/socket";

let lastTypingTime;
const MessageSend = ({ chatId }) => {
  const mediaFile = useRef();
  // const [mediaBox, setMediaBox] = useState(false);
  // const [mediaURL, setMediaURL] = useState("");
  const [newMessage, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const dispatch = useDispatch();
  const isSendLoading = useSelector((store) => store?.condition?.isSendLoading);
  const isSocketConnected = useSelector(
    (store) => store?.condition?.isSocketConnected
  );
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const isTyping = useSelector((store) => store?.condition?.isTyping);

  useEffect(() => {
    socket.on("typing", () => dispatch(setTyping(true)));
    socket.on("stop typing", () => dispatch(setTyping(false)));
  }, []);

  // Media Box Control
const handleMediaBox = (e) => {
  console.log("FILE CHANGE TRIGGERED");

  const file = e.target.files[0];
  console.log("FILE =>", file);

  if (file) {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only images (JPEG, PNG, GIF, WEBP) and PDF files are allowed!");
      mediaFile.current.value = "";
      return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB!");
      mediaFile.current.value = "";
      return;
    }

    setSelectedFile(file);
    toast.success("File selected: " + file.name);
  }
};



 
const handleSendMessage = async () => {
  console.log("BACKEND URL =", import.meta.env.VITE_BACKEND_URL);
  console.log("SEND CLICKED");

  if (!newMessage?.trim() && !selectedFile) return;

  if (!chatId) {
    console.log("❌ chatId missing");
    return;
  }

  if (selectedChat?._id) {
    socket.emit("stop typing", selectedChat._id);
  }

  dispatch(setSendLoading(true));

  const token = localStorage.getItem("token");
  const formData = new FormData();

  formData.append("chatId", chatId);

  if (newMessage.trim()) {
    formData.append("message", newMessage.trim());
  }

  if (selectedFile) {
    formData.append("file", selectedFile);
  }

  console.log("FORM DATA FILE =", selectedFile);

  setMessage("");
  setSelectedFile(null);
  mediaFile.current.value = "";

  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await res.json();
    console.log("SERVER RESPONSE =", json);

    dispatch(addNewMessageId(json?.data?._id));
    dispatch(addNewMessage(json?.data));
    socket.emit("new message", json.data);
  } catch (err) {
    console.log("SEND ERROR =", err);
    toast.error("Message Sending Failed");
  } finally {
    dispatch(setSendLoading(false));
  }
};


  const handleTyping = (e) => {
    setMessage(e.target?.value);
    if (!isSocketConnected) return;
    if (!isTyping) {
      socket.emit("typing", selectedChat._id);
    }
    lastTypingTime = new Date().getTime();
    let timerLength = 3000;
    let stopTyping = setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff > timerLength) {
        socket.emit("stop typing", selectedChat._id);
      }
    }, timerLength);
    return () => clearTimeout(stopTyping);
  };

  return (
    <>
      {/* File Preview */}
      {selectedFile && (
        <div className="border-slate-500 border rounded-md absolute bottom-[7vh] mb-1 left-2 bg-slate-800 w-60 h-48">
          {selectedFile.type.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="h-full w-full object-contain rounded-md"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-white p-4">
              <div className="text-4xl mb-2">
                {selectedFile.type === 'application/pdf' ? (
                  <FaFilePdf className="text-red-400" />
                ) : (
                  <FaFile className="text-gray-400" />
                )}
              </div>
              <div className="text-sm text-center">
                <div className="font-medium">{selectedFile.name}</div>
                <div className="text-gray-400 text-xs mt-1">
                  {selectedFile.type === 'application/pdf' ? 'PDF Document' : 'File'}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setSelectedFile(null);
              mediaFile.current.value = "";
            }}
            className="absolute top-2 right-3 cursor-pointer text-white bg-red-600 hover:bg-red-700 rounded-full p-1 w-6 h-6 flex items-center justify-center text-sm"
            title="Remove file"
          >
            ×
          </button>
        </div>
      )}
      
      <form
        className="w-full flex items-center gap-1 h-[7vh] p-3 bg-slate-800 text-white"
        onSubmit={(e) => e.preventDefault()}
      >
        <FaFolderOpen
          title="Open File"
          size={22}
          className="cursor-pointer active:scale-75 hover:text-green-400"
          onClick={() => {
            console.log("ICON CLICKED");
            mediaFile.current.click();
          }}
        />

        <input
          ref={mediaFile}
          type="file"
          accept="image/*,application/pdf,.pdf"
          style={{ display: "none" }}
          onChange={handleMediaBox}
        />

        <input
          type="text"
          className="outline-none p-2 w-full bg-transparent"
          placeholder={
            selectedFile 
              ? `${selectedFile.type === 'application/pdf' ? '📄' : selectedFile.type.startsWith('image/') ? '🖼️' : '📎'} ${selectedFile.name}` 
              : "Type a message"
          }
          value={newMessage}
          onChange={(e) => handleTyping(e)}
        />
        <span className="flex justify-center items-center">
          {(newMessage?.trim() || selectedFile) && !isSendLoading && (
            <button
              type="button"
              className="outline-none p-2 border-slate-500 border-l"
              onClick={handleSendMessage}
            >
              <FaPaperPlane
                title="Send"
                size={18}
                className="active:scale-75 hover:text-green-400"
              />
            </button>
          )}
          {isSendLoading && (
            <button className="outline-none p-2 border-slate-500 border-l">
              <LuLoader
                title="loading..."
                fontSize={18}
                className="animate-spin"
              />
            </button>
          )}
        </span>
      </form>
    </>
  );
};

export default MessageSend;
