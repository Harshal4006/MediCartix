import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {

  try {

    const token = req.headers.token;

    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again"
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // ensure body exists
    if (!req.body) {
      req.body = {};
    }

    req.body.userId = token_decode.id;

    console.log("Authenticated User:", token_decode.id);

    next();

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error"
    });
  }

};

export default authMiddleware;