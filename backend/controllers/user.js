const User = require("../models/user");

const getAuthUser = async (req, res) => {
	if (!req.user) {
		return res.status(404).json({ message: `User Not Found` });
	}
	res.status(200).json({
		data: req.user,
	});
};

const getAllUsers = async (req, res) => {
	const allUsers = await User.find({ _id: { $ne: req.user._id } })
		.select("-password")
		.sort({ _id: -1 });
	res.status(200).send({ data: allUsers });
};

const updateProfile = async (req, res) => {
	const { firstName, lastName } = req.body;
	const userId = req.user._id;

	// Build update object
	const updateData = {};
	if (firstName) updateData.firstName = firstName;
	if (lastName) updateData.lastName = lastName;
	
	// Handle profile image upload
	if (req.file) {
		updateData.image = `/uploads/${req.file.filename}`;
	}

	// Update user
	const updatedUser = await User.findByIdAndUpdate(
		userId,
		updateData,
		{ new: true, select: "-password" }
	);

	if (!updatedUser) {
		return res.status(404).json({ message: "User not found" });
	}

	res.status(200).json({
		message: "Profile updated successfully",
		data: updatedUser,
	});
};

module.exports = { getAuthUser, getAllUsers, updateProfile };
