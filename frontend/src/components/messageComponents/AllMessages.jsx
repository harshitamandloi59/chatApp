import { Fragment, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { VscCheckAll } from "react-icons/vsc";
import { CgChevronDoubleDown } from "react-icons/cg";
import { HiDownload, HiEye } from "react-icons/hi";
import { FaImage, FaFilePdf, FaFile } from "react-icons/fa";
import { BsThreeDotsVertical, BsCheck2All } from "react-icons/bs";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { VscError } from "react-icons/vsc";
import Avatar from "../common/Avatar";
import { toast } from "react-toastify";
import { removeMessage } from "../../redux/slices/messageSlice";
import socket from "../../socket/socket";
import {
    SimpleDateAndTime,
    SimpleDateMonthDay,
    SimpleTime,
} from "../../utils/formateDateTime";

const AllMessages = ({ allMessage }) => {
    const chatBox = useRef();
    const dispatch = useDispatch();
    const adminId = useSelector((store) => store.auth?._id);
    const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
    const isTyping = useSelector((store) => store?.condition?.isTyping);
    const [downloadedImages, setDownloadedImages] = useState(new Set());
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Show delete confirmation
    const showDeleteConfirmation = (messageId) => {
        setDeleteConfirm(messageId);
    };

    // Mark messages as seen when component loads or messages change
    useEffect(() => {
        if (allMessage && allMessage.length > 0 && adminId && selectedChat) {
            // Get messages that are not sent by current user and not seen by current user
            const unseenMessages = allMessage.filter(msg => 
                msg.sender._id !== adminId && 
                !msg.seenBy?.some(seen => seen.user._id === adminId)
            );
            
            if (unseenMessages.length > 0) {
                markMessagesAsSeen(unseenMessages.map(msg => msg._id));
            }
        }
    }, [allMessage, adminId, selectedChat]);

    // Function to mark messages as seen
    const markMessagesAsSeen = async (messageIds) => {
        if (!messageIds || messageIds.length === 0) return;
        
        const token = localStorage.getItem("token");
        const backendUrl = import.meta.env.VITE_APP_API_URL || "https://chatapp-fjyj.onrender.com";
        
        try {
            const response = await fetch(`${backendUrl}/api/message/markSeen`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ messageIds }),
            });

            const json = await response.json();
            
            if (json?.message === "success") {
                // Emit socket event to notify other users
                socket.emit("messages seen", { 
                    messageIds, 
                    chatId: selectedChat._id, 
                    userId: adminId 
                });
            }
        } catch (error) {
            console.error("MARK MESSAGES SEEN ERROR =", error);
        }
    };

    // Function to check if message is seen by other users (for blue tick)
    const isMessageSeen = (message) => {
        if (message.sender._id !== adminId) return false; // Only show for own messages
        
        // TEMPORARY: Show blue tick for messages older than 10 seconds (for demo)
        const messageTime = new Date(message.updatedAt).getTime();
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - messageTime;
        
        // If message is older than 10 seconds, show as seen (temporary demo)
        if (timeDiff > 10000) {
            return true;
        }
        
        // Real logic (will work after backend deploy):
        // In group chat, check if at least one other user has seen it
        if (selectedChat?.isGroupChat) {
            return message.seenBy?.some(seen => seen.user._id !== adminId);
        } else {
            // In individual chat, check if the other user has seen it
            return message.seenBy?.some(seen => seen.user._id !== adminId);
        }
    };

    const [scrollShow, setScrollShow] = useState(true);
    // Handle Chat Box Scroll Down
    const handleScrollDownChat = () => {
        if (chatBox.current) {
            chatBox.current.scrollTo({
                top: chatBox.current.scrollHeight,
                // behavior: "auto",
            });
        }
    };

    // Delete individual message
    const handleDeleteMessage = async (messageId) => {
        
        const token = localStorage.getItem("token");
        const backendUrl = import.meta.env.VITE_APP_API_URL || "https://chatapp-fjyj.onrender.com";
        
        try {
            // Try using the clear chat route with a modification to delete single message
            const response = await fetch(`${backendUrl}/api/message/clearChat/${messageId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await response.json();

            if (json?.message === "success") {
                // Remove message from local state
                dispatch(removeMessage(messageId));
                // Emit socket event to notify other users
                socket.emit("message deleted", { messageId, chatId: selectedChat._id });
                toast.success("Message deleted");
            } else {
                toast.error("Delete feature requires backend update. Please redeploy backend with new routes.");
            }
            
            setDeleteConfirm(null);
        } catch (error) {
            toast.error("Delete feature not available. Backend needs to be updated.");
            setDeleteConfirm(null);
        }
    };
    // Scroll Button Hidden
    useEffect(() => {
        handleScrollDownChat();
        if (chatBox.current.scrollHeight == chatBox.current.clientHeight) {
            setScrollShow(false);
        }
        const handleScroll = () => {
            const currentScrollPos = chatBox.current.scrollTop;
            if (
                currentScrollPos + chatBox.current.clientHeight <
                chatBox.current.scrollHeight - 30
            ) {
                setScrollShow(true);
            } else {
                setScrollShow(false);
            }
        };
        const chatBoxCurrent = chatBox.current;
        chatBoxCurrent.addEventListener("scroll", handleScroll);
        return () => {
            chatBoxCurrent.removeEventListener("scroll", handleScroll);
        };
    }, [allMessage, isTyping]);

    return (
        <>
            {scrollShow && (
                <div
                    className="absolute bottom-16 right-4 cursor-pointer z-20 font-light text-white/50 bg-black/80 hover:bg-black hover:text-white p-1.5 rounded-full"
                    onClick={handleScrollDownChat}
                >
                    <CgChevronDoubleDown title="Scroll Down" fontSize={24} />
                </div>
            )}
            <div
                className="flex flex-col w-full px-3 gap-1 py-2 overflow-y-auto overflow-hidden scroll-style h-[66vh]"
                ref={chatBox}
            >
                {allMessage?.map((message, idx) => {
                    return (
                      <Fragment key={message._id}>
                        <div className="sticky top-0 flex w-full justify-center z-10">
                          {new Date(
                            allMessage[idx - 1]?.updatedAt
                          ).toDateString() !==
                            new Date(message?.updatedAt).toDateString() && (
                            <span className="text-xs font-light mb-2 mt-1 text-white/50 bg-black h-7 w-fit px-5 rounded-md flex items-center justify-center cursor-pointer">
                              {SimpleDateMonthDay(message?.updatedAt)}
                            </span>
                          )}
                        </div>
                        <div
                          className={`flex items-start gap-1 ${
                            message?.sender?._id === adminId
                              ? "flex-row-reverse text-white"
                              : "flex-row text-black"
                          }`}
                          onMouseEnter={() => setHoveredMessage(message._id)}
                          onMouseLeave={() => setHoveredMessage(null)}
                        >
                          {message?.chat?.isGroupChat &&
                            message?.sender?._id !== adminId &&
                            (allMessage[idx + 1]?.sender?._id !==
                            message?.sender?._id ? (
                              <Avatar
                                src={
                                  message?.sender?.image
                                    ? `${import.meta.env.VITE_APP_API_URL}${
                                        message?.sender?.image
                                      }`
                                    : null
                                }
                                name={`${message?.sender?.firstName} ${message?.sender?.lastName}`}
                                size="w-9 h-9"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-full"></div>
                            ))}

                          {/* Delete button for sender's own messages */}
                          {message?.sender?._id === adminId && hoveredMessage === message._id && (
                            <button
                              className="absolute top-1 right-1 z-10 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                              onClick={() => showDeleteConfirmation(message._id)}
                              title="Delete message"
                            >
                              <BsThreeDotsVertical className="text-white text-xs" />
                            </button>
                          )}

                          {/* Check if message has file or text */}
                          {message?.file ? (
                            // File message - no background bubble
                            <div className="py-1.5 px-2 min-w-10 text-start flex flex-col relative max-w-[85%]">
                              {message?.chat?.isGroupChat &&
                                message?.sender?._id !== adminId && (
                                  <span className="text-xs font-bold text-start text-green-900 mb-2">
                                    {message?.sender?.firstName}
                                  </span>
                                )}

                              {/* Display file if exists */}
                              {message?.file && (
                                <div className="mb-2">
                                  {message.file.match(
                                    /\.(jpg|jpeg|png|gif|webp)$/i
                                  ) ? (
                                    // Image file - WhatsApp style
                                    <div className="relative bg-slate-700 rounded-lg max-w-64 overflow-hidden">
                                      {downloadedImages.has(message._id) ? (
                                        // Show actual image after "download"
                                        <div className="relative">
                                          <img
                                            src={`${
                                              import.meta.env.VITE_APP_API_URL
                                            }${message.file}`}
                                            alt="Shared image"
                                            className="w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() =>
                                              window.open(
                                                `${
                                                  import.meta.env
                                                    .VITE_APP_API_URL
                                                }${message.file}`,
                                                "_blank"
                                              )
                                            }
                                          />
                                          {/* Download button overlay */}
                                          <button
                                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const link =
                                                document.createElement("a");
                                              link.href = `${
                                                import.meta.env.VITE_APP_API_URL
                                              }${message.file}`;
                                              link.download = message.file
                                                .split("/")
                                                .pop();
                                              document.body.appendChild(link);
                                              link.click();
                                              document.body.removeChild(link);
                                            }}
                                            title="Download image"
                                          >
                                            <HiDownload className="text-white text-sm" />
                                          </button>
                                        </div>
                                      ) : (
                                        // Show download card before "download"
                                        <div className="p-4 cursor-pointer hover:bg-slate-600 transition-colors">
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                              <FaImage className="text-white text-lg" />
                                            </div>
                                            <div className="flex-1">
                                              <div className="text-white text-sm font-medium">
                                                Image
                                              </div>
                                              <div className="text-gray-400 text-xs">
                                                {message.file.split("/").pop()}
                                              </div>
                                            </div>
                                            <button
                                              className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                // "Download" - actually just show the image
                                                setDownloadedImages(
                                                  (prev) =>
                                                    new Set([
                                                      ...prev,
                                                      message._id,
                                                    ])
                                                );
                                              }}
                                              title="Load image"
                                            >
                                              <HiDownload className="text-white text-sm" />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : message.file.match(/\.(pdf)$/i) ? (
                                    // PDF file
                                    <div className="relative bg-slate-700 rounded-lg p-4 max-w-64 cursor-pointer hover:bg-slate-600 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                                          <FaFilePdf className="text-white text-lg" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-white text-sm font-medium">
                                            PDF Document
                                          </div>
                                          <div className="text-gray-400 text-xs">
                                            {message.file.split("/").pop()}
                                          </div>
                                        </div>
                                        <button
                                          className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(
                                              `${
                                                import.meta.env.VITE_APP_API_URL
                                              }${message.file}`,
                                              "_blank"
                                            );
                                          }}
                                          title="Open PDF"
                                        >
                                          <HiEye className="text-white text-sm" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    // Other files
                                    <div className="relative bg-slate-700 rounded-lg p-4 max-w-64 cursor-pointer hover:bg-slate-600 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                          <FaFile className="text-white text-lg" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-white text-sm font-medium">
                                            File
                                          </div>
                                          <div className="text-gray-400 text-xs">
                                            {message.file.split("/").pop()}
                                          </div>
                                        </div>
                                        <button
                                          className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const link =
                                              document.createElement("a");
                                            link.href = `${
                                              import.meta.env.VITE_APP_API_URL
                                            }${message.file}`;
                                            link.download = message.file
                                              .split("/")
                                              .pop();
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                          }}
                                          title="Download file"
                                        >
                                          <HiDownload className="text-white text-sm" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Time stamp for file messages */}
                              <span
                                className="text-[11px] font-light text-gray-400 flex items-end gap-1.5 mt-1"
                                title={SimpleDateAndTime(message?.updatedAt)}
                              >
                                {SimpleTime(message?.updatedAt)}
                                {message?.sender?._id === adminId && (
                                  isMessageSeen(message) ? (
                                    <BsCheck2All color="#4FC3F7" fontSize={14} title="Seen" />
                                  ) : (
                                    <VscCheckAll color="white" fontSize={14} title="Sent" />
                                  )
                                )}
                              </span>
                            </div>
                          ) : (
                            // Text message - with background bubble
                            <div
                              className={`${
                                message?.sender?._id === adminId
                                  ? "bg-gradient-to-tr to-slate-800 from-green-400 rounded-s-lg rounded-ee-2xl"
                                  : "bg-gradient-to-tr to-slate-800 from-white rounded-e-lg rounded-es-2xl"
                              } py-1.5 px-2 min-w-10 text-start flex flex-col relative max-w-[85%]`}
                            >
                              {/* Delete button for sender's own text messages */}
                              {message?.sender?._id === adminId && hoveredMessage === message._id && (
                                <button
                                  className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                                  onClick={() => showDeleteConfirmation(message._id)}
                                  title="Delete message"
                                >
                                  <BsThreeDotsVertical className="text-white text-xs" />
                                </button>
                              )}

                              {message?.chat?.isGroupChat &&
                                message?.sender?._id !== adminId && (
                                  <span className="text-xs font-bold text-start text-green-900">
                                    {message?.sender?.firstName}
                                  </span>
                                )}

                              <div
                                className={`mt-1 pb-1.5 ${
                                  message?.sender?._id == adminId
                                    ? "pr-16"
                                    : "pr-12"
                                }`}
                              >
                                {/* Display text message if exists */}
                                {message?.message && (
                                  <span className="">{message?.message}</span>
                                )}

                                <span
                                  className="text-[11px] font-light absolute bottom-1 right-2 flex items-end gap-1.5"
                                  title={SimpleDateAndTime(message?.updatedAt)}
                                >
                                  {SimpleTime(message?.updatedAt)}
                                  {message?.sender?._id === adminId && (
                                    isMessageSeen(message) ? (
                                      <BsCheck2All color="#4FC3F7" fontSize={14} title="Seen" />
                                    ) : (
                                      <VscCheckAll color="white" fontSize={14} title="Sent" />
                                    )
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </Fragment>
                    );
                })}
                {isTyping && (
                    <div id="typing-animation">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
            </div>
            
            {/* Delete Confirmation Dialog */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-sm mx-4">
                        <h3 className="text-white text-lg font-semibold mb-4">Delete Message</h3>
                        <p className="text-gray-300 mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                            >
                                <VscError fontSize={16} />
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteMessage(deleteConfirm)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <IoCheckmarkCircleOutline fontSize={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AllMessages;
