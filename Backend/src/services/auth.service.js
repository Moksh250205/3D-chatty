const User = require("../models/User.model");
const { generateToken } = require("../utils/jwt");

const registerUser = async (userData) => {
  const { name, email, gender, age, password } = userData;

  const existingUserEmail = await User.findOne({ email });
  if (existingUserEmail) {
    throw new Error("Email address is already registered");
  }

  const user = new User({
    name,
    email,
    password,
    age,
    gender,
  });

  await user.save();

  await user.save();
  const token = generateToken(user);
  return { user: {
    id: user._id, 
    name: user.name, 
    age: user.age, 
    gender:user.gender,
    email: user.email 
  }, token };
};


const loginUser = async (userData) => {
    const { email, password } = userData;
  
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
  
    const isCorrect = await user.comparePassword(password);
    if (!isCorrect) {
      throw new Error("Invalid credentials");
    }
    const token = generateToken(user);
    return { token, user: {
        id: user._id, 
        name: user.name, 
        age: user.age, 
        gender:user.gender,
        email: user.email 
      } };
  };

  module.exports = {loginUser, registerUser}; 