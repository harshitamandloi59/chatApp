import React, { Fragment, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { VscCheckAll } from "react-icons/vsc";
import { CgChevronDoubleDown } from "react-icons/cg";
import { HiDownload, HiEye } from "react-icons/hi";
import { FaImage, FaFilePdf, FaFile } from "react-icons/fa";
import Avatar from "../common/Avatar";
import {
    SimpleDateAndTime,
    SimpleDateMonthDay,
    SimpleTime,
} from "../../utils/formateDateTime";

const AllMessages = ({ allMessage }) => {
    const chatBox = useRef();
    const adminId = useSelector((store) => store.auth?._id);
    const isTyping = useSelector((store) => store?.condition?.isTyping);
    const [downloadedImages, setDownloadedImages] = useState(new Set());

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
                                  <VscCheckAll color="white" fontSize={14} />
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
                                    <VscCheckAll color="white" fontSize={14} />
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
        </>
    );
};

export default AllMessages;
