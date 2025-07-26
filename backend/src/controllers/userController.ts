
import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * @route   PUT /api/users/profile
 * @desc    Update user's profile (phone, address)
 * @access  Private
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  // The user ID comes from the JWT after being verified by the auth middleware
  const userId = req.user?.id;
  const { phone, address } = req.body;

  try {
    // 1. Authorization check
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // 2. Input validation
    if (!phone || !address) {
      return res.status(400).json({ message: 'Phone and address are required' });
    }

    // 3. Update user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        address,
        isProfileComplete: true, // Mark the profile as complete
      },
      // Select the fields to return, excluding the password
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        phone: true,
        address: true,
        isProfileComplete: true,
      }
    });

    // 4. Return the updated user data
    res.status(200).json(updatedUser);

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};
