import bcrypt from "bcrypt";
import User from "../Schema/User.js";

// Regular expression to validate passwords: 
// Must contain 1 digit, 1 lowercase, 1 uppercase letter, and be 6-20 characters long
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

export const changePassword = async (req, res) => {

  try {

    // Extracting current and new password from the request body
    const { currentPassword, newPassword } = req.body;

    // Getting the user ID from the authenticated user (usually from middleware)
    const user_id = req.user;

    // Check if either the current or new password does not match the regex pattern
    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return res.status(403).json({
        error:
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter.",
      });
    }

    // Find the user in the database by their ID
    const user = await User.findOne({ _id: user_id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user logged in using Google authentication, prevent password change
    if (user.google_auth) {
      return res.status(403).json({
        error:
          "You can't change the account password because you logged in through Google.",
      });
    }

    // Compare the provided current password with the hashed password stored in the database
    bcrypt.compare(currentPassword, user.personal_info.password, async (err, result) => {

      if (err) {
        return res.status(500).json({
          error:
            "An error occurred while checking the current password. Please try again later.",
        });
      }

      if (!result) {
        return res.status(403).json({ error: "Incorrect current password" });
      }

      try {

        // Hash the new password using bcrypt with a salt round of 10
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        await User.findOneAndUpdate(
          { _id: user_id },
          { "personal_info.password": hashedPassword }   // Set new hashed password
        );

        return res.status(200).json({ status: "Password changed" });

      } catch (error) {

        return res.status(500).json({
          error: "An error occurred while updating the new password. Please try again later.",
        });
      }
    });

  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }

};
