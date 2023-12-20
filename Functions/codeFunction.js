const { Code } = require("../Models/CodeSchema");

async function isUserPremium(userId) {
  const codes = await Code.findOne({
    "redeemedBy.id": userId.toString(),
  });

  return codes.length > 0;
}

module.exports = { isUserPremium };
