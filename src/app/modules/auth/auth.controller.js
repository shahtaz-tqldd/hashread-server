const config = require("../../../config/config");
const catchAsync = require("../../../shared/catchAsync");
const sendResponse = require("../../../shared/sendResponse");
const AuthService = require("./auth.service");

const login = catchAsync(async (req, res, next) => {
  const result = await AuthService.loginService(req.body);
  const { refreshToken, accessToken, user } = result;

  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.cookie("accessToken", accessToken, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully!",
    data: {
      user,
      accessToken,
    },
  });
});

const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);

  if (result.error) {
    return res.status(result.status).json({
      statusCode: result.status,
      success: false,
      message: result.error,
    });
  } else {
    // set refresh token into cookie
    const cookieOptions = {
      secure: config.env === "production",
      httpOnly: true,
      sameSite: "strict",
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Token refreshed successfully!",
      data: result,
    });
  }
});

module.exports = {
  login,
  refreshToken,
};
