import { verifyToken } from '../helpers/jwt';

// function to check if the user is admin
async function isAdmin(token: string) {
  try {
    const data = await verifyToken(token);
    return (data.isAdmin);
  } catch (error) {
    return false;
  }
}

export {
  isAdmin,
}