import { User } from '../models/User';

export class UserService {
  async createUser(userData: any) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  async findUserById(id: string) {
    try {
      return await User.findById(id);
    } catch (error) {
      throw error;
    }
  }
}