import bcrypt from "bcrypt";
import User from "../models/User.js";
import { cloudinary } from "../config/cloudinary.js";

const uploadAvatarToCloudinary = (
  buffer
) => {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder:
              "gpt1905_avatars",

            transformation: [
              {
                width: 400,
                height: 400,
                crop: "fill",
              },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(result);
          }
        );

      uploadStream.end(buffer);
    }
  );
};

export const updateProfile = async (
  req,
  res
) => {
  try {
    const {
      username,
      password,
      newPassword,
    } = req.body;

    const user =
      await User.findById(
        req.userId
      ).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      typeof username === "string" &&
      username.trim()
    ) {
      user.username =
        username.trim();
    }

    if (req.file) {
      const uploadedImage =
        await uploadAvatarToCloudinary(
          req.file.buffer
        );

      user.avatar =
        uploadedImage.secure_url;
    }

    if (password || newPassword) {
      if (
        !password ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "Current password and new password are required.",
        });
      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          message:
            "Incorrect current password",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            "New password must be at least 6 characters long.",
        });
      }

      user.password =
        await bcrypt.hash(
          newPassword,
          10
        );
    }

    await user.save();

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    };

    return res.status(200).json({
      message:
        "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error(
      "Update error:",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};