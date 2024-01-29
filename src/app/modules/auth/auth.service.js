const bcrypt = require("bcrypt");
const jwtHelpers = require("../../../helpers/jwtHelpers");
const ApiError = require("../../../errors/apiError");
const User = require("../user/user.model");
const config = require("../../../config/config");

const loginService = async (payload) => {
  const { email, password } = payload;

  const isExistUser = await User.findOne({
    email,
  });

  if (!isExistUser) {
    throw new ApiError(400, "User does not exist");
  }

  const { _id, role } = isExistUser;

  const isMatchPassword = await bcrypt.compare(password, isExistUser.password);

  if (!isMatchPassword) {
    throw new ApiError(400, "Invalid credentials");
  }

  const accessToken = jwtHelpers.createToken(
    { _id, email, role },
    config.jwt.secret,
    config.jwt.expires_in
  );

  const refreshToken = jwtHelpers.createToken(
    { _id, email, role },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );

  return {
    user: isExistUser,
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token) => {
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(token, config.jwt.refresh_secret);
  } catch (error) {
    return {
      error: "Invalid Refresh Token",
      status: 422,
    };
  }

  const { _id } = verifiedToken;

  const isUserExist = await User.findById(_id);
  if (!isUserExist) {
    throw new ApiError(404, "User does not exist");
  }

  const newAccessToken = jwtHelpers.createToken(
    {
      _id: isUserExist._id,
      email: isUserExist.email,
      role: isUserExist.role,
    },
    config.jwt.secret,
    config.jwt.expires_in
  );

  return {
    accessToken: newAccessToken,
    user: isUserExist,
  };
};

module.exports = {
  loginService,
  refreshToken,
};
