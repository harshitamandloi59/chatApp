import React, { useRef, useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import { FaCamera, FaEdit } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setProfileDetail } from "../redux/slices/conditionSlice";
import { addAuth } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
import Avatar from "./common/Avatar";
import { getImageUrl } from "../utils/imageUrl";

const ProfileDetail = () => {
	const dispatch = useDispatch();
	const user = useSelector((store) => store.auth);
	const [isEditing, setIsEditing] = useState(false);
	const [firstName, setFirstName] = useState(user.firstName || "");
	const [lastName, setLastName] = useState(user.lastName || "");
	const [selectedImage, setSelectedImage] = useState(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const fileInputRef = useRef();

	const handleImageSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Check file type
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
			
			if (!allowedTypes.includes(file.type)) {
				toast.error("Only images (JPEG, PNG, GIF, WEBP) are allowed!");
				return;
			}

			// Check file size (5MB limit for profile pics)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Image size must be less than 5MB!");
				return;
			}

			setSelectedImage(file);
		}
	};

	const handleUpdate = async () => {
		if (!firstName.trim() || !lastName.trim()) {
			toast.error("First name and last name are required!");
			return;
		}

		setIsUpdating(true);
		const token = localStorage.getItem("token");
		const formData = new FormData();
		
		formData.append("firstName", firstName.trim());
		formData.append("lastName", lastName.trim());
		
		if (selectedImage) {
			formData.append("profileImage", selectedImage);
		}

		try {
			const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/user/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

			const result = await response.json();

			if (response.ok) {
				dispatch(addAuth(result.data));
				toast.success("Profile updated successfully!");
				setIsEditing(false);
				setSelectedImage(null);
			} else {
				toast.error(result.message || "Failed to update profile");
			}
		} catch (error) {
			toast.error("Failed to update profile");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
		setFirstName(user.firstName || "");
		setLastName(user.lastName || "");
		setSelectedImage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
    <div className="flex -m-2 sm:-m-4 flex-col items-center my-6 text-slate-300 min-h-screen w-full fixed top-0 justify-center z-50">
      <div className="p-3 pt-4 w-[80%] sm:w-[60%] md:w-[50%] lg:w-[40%] min-w-72 max-w-[1000px] border border-slate-400 bg-slate-800 rounded-lg h-fit mt-5 transition-all relative">
        <h2 className="text-2xl underline underline-offset-8 font-semibold text-slate-100 w-full text-center mb-2">
          Profile
        </h2>
        <div className="w-full py-4 justify-evenly flex flex-wrap items-center gap-3">
          <div className="self-end flex-1 min-w-48">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full p-2 bg-slate-600 border border-slate-600 rounded text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold p-1">
                  Name : {user.firstName} {user.lastName}
                </h3>
                <h3 className="text-xl font-semibold p-1">
                  Email : {user.email}
                </h3>
              </div>
            )}

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded mt-3 hidden sm:block"
            >
              Logout
            </button>
          </div>

          <div className="self-end flex w-full sm:w-fit items-center justify-evenly sm:flex-col">
            <div className="relative">
              <Avatar
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : getImageUrl(user.image)
                }
                name={`${user.firstName} ${user.lastName}`}
                size="w-20 h-20"
                className="border-2 border-slate-600"
              />
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                  title="Change profile picture"
                >
                  <FaCamera className="text-white text-sm" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <div className="flex flex-col gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-bold py-1.5 px-4 rounded transition-colors"
                  >
                    {isUpdating ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white font-bold py-1.5 px-4 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded flex items-center gap-2 transition-colors"
                >
                  <FaEdit className="text-sm" />
                  Edit Profile
                </button>
              )}

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.reload();
                }}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded sm:hidden"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        <div
          title="Close"
          onClick={() => dispatch(setProfileDetail())}
          className="bg-black/15 hover:bg-black/50 h-7 w-7 rounded-md flex items-center justify-center absolute top-2 right-3 cursor-pointer"
        >
          <MdOutlineClose size={22} />
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
